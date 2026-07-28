CREATE TABLE "favorites" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "moto_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "favorites_user_id_moto_id_key" ON "favorites"("user_id", "moto_id");
CREATE INDEX "favorites_user_id_idx" ON "favorites"("user_id");

ALTER TABLE "favorites"
ADD CONSTRAINT "favorites_moto_id_fkey"
FOREIGN KEY ("moto_id") REFERENCES "motos"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
