/*
  Warnings:

  - You are about to alter the column `title` on the `Song` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `VarChar(50)`.

*/
-- AlterTable
ALTER TABLE `Song` ADD COLUMN `album` VARCHAR(50) NOT NULL DEFAULT 'Single',
    ADD COLUMN `artist` VARCHAR(50) NOT NULL DEFAULT 'Unknown artist',
    ADD COLUMN `duration` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `year` INTEGER NULL,
    MODIFY `title` VARCHAR(50) NOT NULL;
