-- CreateTable
CREATE TABLE `SystemConfig` (
    `id` INTEGER NOT NULL DEFAULT 1,
    `is_register_blocked` BOOLEAN NOT NULL DEFAULT false,
    `is_login_blocked` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
