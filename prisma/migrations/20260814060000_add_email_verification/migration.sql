-- AlterTable
ALTER TABLE `merchant` ADD COLUMN `emailVerifiedAt` DATETIME(3) NULL,
    ADD COLUMN `verifyExpiresAt` DATETIME(3) NULL,
    ADD COLUMN `verifyToken` VARCHAR(191) NULL;
-- CreateIndex
CREATE UNIQUE INDEX `merchant_verifyToken_key` ON `merchant`(`verifyToken`);
