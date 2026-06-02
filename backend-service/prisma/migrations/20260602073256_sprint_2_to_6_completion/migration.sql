-- AlterTable
ALTER TABLE "invoices" ADD COLUMN     "bank_name" TEXT;

-- CreateTable
CREATE TABLE "invoice_items" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "item_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "invoice_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expense_categories" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "expense_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "operational_expenses" (
    "id" TEXT NOT NULL,
    "category_id" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "period_date" TIMESTAMP(3) NOT NULL,
    "description" TEXT,
    "receipt_url" TEXT,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "operational_expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_usaha" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "pic_name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_usaha_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_limits" (
    "id" TEXT NOT NULL,
    "unit_usaha_id" TEXT NOT NULL,
    "allocated_quota" DOUBLE PRECISION NOT NULL,
    "fiscal_year" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "budget_limits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "budget_absorptions" (
    "id" TEXT NOT NULL,
    "budget_limit_id" TEXT NOT NULL,
    "amount_absorbed" DOUBLE PRECISION NOT NULL,
    "activity_name" TEXT NOT NULL,
    "reference_type" TEXT,
    "reference_id" TEXT,
    "receipt_url" TEXT,
    "absorbed_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "budget_absorptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "external_revenues" (
    "id" TEXT NOT NULL,
    "source_unit" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "transaction_date" TIMESTAMP(3) NOT NULL,
    "reference_no" TEXT NOT NULL,
    "description" TEXT,
    "imported_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "external_revenues_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "invoice_items_invoice_id_idx" ON "invoice_items"("invoice_id");

-- CreateIndex
CREATE UNIQUE INDEX "expense_categories_code_key" ON "expense_categories"("code");

-- CreateIndex
CREATE INDEX "operational_expenses_category_id_period_date_idx" ON "operational_expenses"("category_id", "period_date");

-- CreateIndex
CREATE UNIQUE INDEX "unit_usaha_code_key" ON "unit_usaha"("code");

-- CreateIndex
CREATE INDEX "budget_limits_fiscal_year_idx" ON "budget_limits"("fiscal_year");

-- CreateIndex
CREATE UNIQUE INDEX "budget_limits_unit_usaha_id_fiscal_year_key" ON "budget_limits"("unit_usaha_id", "fiscal_year");

-- CreateIndex
CREATE INDEX "budget_absorptions_budget_limit_id_absorbed_at_idx" ON "budget_absorptions"("budget_limit_id", "absorbed_at");

-- CreateIndex
CREATE UNIQUE INDEX "external_revenues_reference_no_key" ON "external_revenues"("reference_no");

-- CreateIndex
CREATE INDEX "external_revenues_source_unit_transaction_date_idx" ON "external_revenues"("source_unit", "transaction_date");

-- AddForeignKey
ALTER TABLE "invoice_items" ADD CONSTRAINT "invoice_items_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "operational_expenses" ADD CONSTRAINT "operational_expenses_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "expense_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_limits" ADD CONSTRAINT "budget_limits_unit_usaha_id_fkey" FOREIGN KEY ("unit_usaha_id") REFERENCES "unit_usaha"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "budget_absorptions" ADD CONSTRAINT "budget_absorptions_budget_limit_id_fkey" FOREIGN KEY ("budget_limit_id") REFERENCES "budget_limits"("id") ON DELETE CASCADE ON UPDATE CASCADE;
