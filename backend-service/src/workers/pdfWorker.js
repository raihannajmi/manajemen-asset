const { Worker, Queue } = require('bullmq');
const puppeteer = require('puppeteer');
const fs = require('fs/promises');
const path = require('path');
const { s3Client, getPublicUrl } = require('../shared/utils/s3Uploader');
const { PutObjectCommand } = require('@aws-sdk/client-s3');
const prisma = require('../config/db');
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
};

// Queue for adding PDF generation jobs
const pdfQueue = new Queue('pdf-generation', { connection: redisConfig });

// Helper to replace template variables
const compileTemplate = async (templateName, data) => {
  const templatePath = path.join(__dirname, '../shared/templates', `${templateName}.template.html`);
  let html = await fs.readFile(templatePath, 'utf-8');
  
  for (const [key, value] of Object.entries(data)) {
    // Simple regex replace for {{key}}
    const regex = new RegExp(`{{${key}}}`, 'g');
    html = html.replace(regex, value || '');
  }
  
  // Handle conditional blocks like {{#if deposit}} ... {{/if}}
  // Very basic implementation:
  const ifDepositRegex = /{{#if deposit}}([\s\S]*?){{\/if}}/g;
  html = html.replace(ifDepositRegex, (match, content) => {
    return data.deposit && data.deposit > 0 ? content : '';
  });

  return html;
};

// The Worker process
const pdfWorker = new Worker('pdf-generation', async job => {
  const { type, data, referenceId } = job.data;
  console.log(`[Worker] Started processing PDF job ${job.id} for ${type} (Ref: ${referenceId})`);

  let browser;
  try {
    // 1. Compile HTML Template
    const htmlContent = await compileTemplate(type, data);

    // 2. Launch Puppeteer to generate PDF
    browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' }
    });

    // 3. Upload to Cloudflare R2
    const fileName = `pdfs/${type}/${referenceId}-${Date.now()}.pdf`;
    
    const uploadParams = {
      Bucket: process.env.R2_BUCKET_NAME,
      Key: fileName,
      Body: pdfBuffer,
      ContentType: 'application/pdf'
    };
    
    await s3Client.send(new PutObjectCommand(uploadParams));
    const publicPdfUrl = getPublicUrl(fileName);

    // 4. Update Database
    if (type === 'invoice') {
      await prisma.invoice.update({
        where: { id: referenceId },
        data: { pdfUrl: publicPdfUrl }
      });
    } else if (type === 'contract') {
      await prisma.contract.update({
        where: { id: referenceId },
        data: { pdfUrl: publicPdfUrl }
      });
    }

    console.log(`[Worker] Successfully generated & uploaded PDF for ${type}: ${publicPdfUrl}`);
    return publicPdfUrl;

  } catch (error) {
    console.error(`[Worker] Error processing PDF job ${job.id}:`, error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}, { connection: redisConfig });

pdfWorker.on('completed', job => {
  console.log(`[Worker] Job ${job.id} has completed!`);
});

pdfWorker.on('failed', (job, err) => {
  console.log(`[Worker] Job ${job.id} has failed with ${err.message}`);
});

module.exports = {
  pdfQueue,
  pdfWorker
};
