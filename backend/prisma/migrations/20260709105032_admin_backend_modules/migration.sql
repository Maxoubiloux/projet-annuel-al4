-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "deposit_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "payment_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
ADD COLUMN     "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
ADD COLUMN     "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "motos" ADD COLUMN     "deposit" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "location" VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN     "next_service_date" TIMESTAMP(3),
ALTER COLUMN "serial_number" DROP NOT NULL,
ALTER COLUMN "consumption" DROP NOT NULL,
ALTER COLUMN "hp" DROP NOT NULL,
ALTER COLUMN "range" DROP NOT NULL,
ALTER COLUMN "style" DROP NOT NULL,
ALTER COLUMN "torque" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "first_name" VARCHAR(100),
ADD COLUMN     "last_name" VARCHAR(100),
ADD COLUMN     "license_number" VARCHAR(50),
ADD COLUMN     "license_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" VARCHAR(30),
ADD COLUMN     "status" VARCHAR(20) NOT NULL DEFAULT 'active';

-- CreateTable
CREATE TABLE "maintenance_jobs" (
    "id" UUID NOT NULL,
    "moto_id" UUID NOT NULL,
    "type" VARCHAR(100) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "km" VARCHAR(20) NOT NULL,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "sev" VARCHAR(20) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'open',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "maintenance_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "ref" VARCHAR(30) NOT NULL,
    "booking_id" UUID,
    "customer_id" UUID NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "deposit" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "method" VARCHAR(30) NOT NULL DEFAULT 'card',
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "key" VARCHAR(50) NOT NULL,
    "value" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_ref_key" ON "payments"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "payments_booking_id_key" ON "payments"("booking_id");

-- AddForeignKey
ALTER TABLE "maintenance_jobs" ADD CONSTRAINT "maintenance_jobs_moto_id_fkey" FOREIGN KEY ("moto_id") REFERENCES "motos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- DataMigration: les motos seedées valent toutes "PUBLISHED", ce qui ne correspond
-- à aucune valeur de l'enum front (available|reserved|maintenance|inactive).
-- On aligne sur "available" pour que la flotte existante s'affiche correctement.
UPDATE "statuses" SET "name" = 'available' WHERE "name" = 'PUBLISHED';
