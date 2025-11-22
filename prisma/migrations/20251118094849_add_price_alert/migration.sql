/*
  Warnings:

  - Added the required column `condition` to the `PriceAlert` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PriceAlert" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "condition" TEXT NOT NULL;
