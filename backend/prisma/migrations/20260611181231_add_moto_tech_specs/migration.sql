/*
  Warnings:

  - Added the required column `consumption` to the `motos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hp` to the `motos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `range` to the `motos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `style` to the `motos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `torque` to the `motos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `year` to the `motos` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "motos" ADD COLUMN     "consumption" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "hp" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "range" INTEGER NOT NULL,
ADD COLUMN     "style" VARCHAR(50) NOT NULL,
ADD COLUMN     "torque" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "year" INTEGER NOT NULL;
