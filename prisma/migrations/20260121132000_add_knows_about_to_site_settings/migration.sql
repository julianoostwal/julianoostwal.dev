-- AlterTable
ALTER TABLE "site_settings" ADD COLUMN "knows_about" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
