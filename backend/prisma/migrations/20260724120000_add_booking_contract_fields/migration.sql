-- Ajout des champs de suivi de génération asynchrone du contrat de location.
-- Les deux colonnes sont sûres sur une table non vide (défaut + nullable).
-- Voir ADR 007 (isolation worker / files RabbitMQ).

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "contract_status" VARCHAR(20) NOT NULL DEFAULT 'pending',
ADD COLUMN     "contract_pdf_url" TEXT;
