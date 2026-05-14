require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Cleaning up duplicate documents...');
  
  // Find duplicates
  const duplicates = await prisma.$queryRaw`
    SELECT request_id, doc_type, COUNT(*) 
    FROM rental_request_documents 
    GROUP BY request_id, doc_type 
    HAVING COUNT(*) > 1
  `;

  for (const dup of duplicates) {
    console.log(`Fixing duplicate for Request: ${dup.request_id}, Type: ${dup.doc_type}`);
    
    // Get all IDs for this pair
    const docs = await prisma.rentalRequestDocument.findMany({
      where: {
        requestId: dup.request_id,
        docType: dup.doc_type
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Keep the first (latest), delete the rest
    const idsToDelete = docs.slice(1).map(d => d.id);
    
    await prisma.rentalRequestDocument.deleteMany({
      where: {
        id: { in: idsToDelete }
      }
    });
  }

  console.log('Cleanup complete.');
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
