-- CreateTable
CREATE TABLE `place` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `province` VARCHAR(191) NOT NULL,
    `summary` TEXT NOT NULL,
    `image` TEXT NOT NULL,
    `imageCredit` JSON NULL,
    `address` VARCHAR(191) NULL,
    `hours` VARCHAR(191) NULL,
    `priceRange` VARCHAR(191) NULL,
    `lat` DOUBLE NULL,
    `lng` DOUBLE NULL,
    `affiliate` JSON NULL,
    `sponsored` INTEGER NOT NULL DEFAULT 0,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `place_slug_key`(`slug`),
    INDEX `place_province_idx`(`province`),
    INDEX `place_category_idx`(`category`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `province` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `nameEn` VARCHAR(191) NOT NULL,
    `region` VARCHAR(191) NOT NULL,
    `summary` TEXT NOT NULL,
    `image` TEXT NOT NULL,
    `imageCredit` JSON NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `body` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `province_slug_key`(`slug`),
    INDEX `province_region_idx`(`region`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
