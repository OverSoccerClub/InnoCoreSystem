/*
  Warnings:

  - You are about to drop the column `address` on the `partners` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TaxRegime" AS ENUM ('SIMPLES_NACIONAL', 'LUCRO_PRESUMIDO', 'LUCRO_REAL');

-- CreateEnum
CREATE TYPE "NfeEnvironment" AS ENUM ('PRODUCAO', 'HOMOLOGACAO');

-- AlterTable
ALTER TABLE "partners" DROP COLUMN "address",
ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "complement" TEXT,
ADD COLUMN     "fantasyName" TEXT,
ADD COLUMN     "ie" TEXT,
ADD COLUMN     "im" TEXT,
ADD COLUMN     "mobile" TEXT,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "notes" TEXT,
ADD COLUMN     "number" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "zipCode" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "cest" TEXT,
ADD COLUMN     "cfop" TEXT,
ADD COLUMN     "costPrice" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "icmsRate" DECIMAL(5,2),
ADD COLUMN     "ncm" TEXT,
ADD COLUMN     "origin" INTEGER DEFAULT 0;

-- AlterTable
ALTER TABLE "sales" ADD COLUMN     "invoiceKey" TEXT,
ADD COLUMN     "invoiceNumber" TEXT,
ADD COLUMN     "invoiceSeries" TEXT,
ADD COLUMN     "invoiceUrl" TEXT;

-- CreateTable
CREATE TABLE "purchases" (
    "id" TEXT NOT NULL,
    "invoiceNumber" TEXT,
    "invoiceSeries" TEXT,
    "invoiceKey" TEXT,
    "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "partnerId" TEXT NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'COMPLETED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_items" (
    "id" TEXT NOT NULL,
    "purchaseId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPrice" DECIMAL(10,2) NOT NULL,
    "total" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "purchase_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL,
    "legalName" TEXT NOT NULL,
    "tradeName" TEXT,
    "cnpj" TEXT NOT NULL,
    "ie" TEXT,
    "im" TEXT,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "website" TEXT,
    "zipCode" TEXT NOT NULL,
    "street" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "complement" TEXT,
    "neighborhood" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "taxRegime" "TaxRegime" NOT NULL DEFAULT 'SIMPLES_NACIONAL',
    "cnae" TEXT,
    "nfeEnvironment" "NfeEnvironment" NOT NULL DEFAULT 'HOMOLOGACAO',
    "nfeSeries" TEXT NOT NULL DEFAULT '1',
    "nfeNextNumber" INTEGER NOT NULL DEFAULT 1,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "company_cnpj_key" ON "company"("cnpj");

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_purchaseId_fkey" FOREIGN KEY ("purchaseId") REFERENCES "purchases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
