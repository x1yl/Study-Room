/*
  Warnings:

  - You are about to drop the column `google_calendar_tokens` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `refresh_token_expires_in` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Post` DROP FOREIGN KEY `Post_createdById_fkey`;

-- AlterTable
ALTER TABLE `Account` DROP COLUMN `google_calendar_tokens`,
    DROP COLUMN `refresh_token_expires_in`;

-- DropTable
DROP TABLE `Post`;
