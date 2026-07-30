-- AlterTable
ALTER TABLE `province` ADD COLUMN `bestTime` TEXT NULL,
    ADD COLUMN `gettingThere` TEXT NULL,
    ADD COLUMN `highlights` JSON NULL,
    ADD COLUMN `localFood` TEXT NULL;
