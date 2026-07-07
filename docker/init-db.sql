-- Créé automatiquement par postgres au premier démarrage du container.
-- moto_rental est déjà créé via POSTGRES_DB ; keycloak doit exister avant
-- que le container Keycloak ne démarre.
SELECT 'CREATE DATABASE keycloak'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'keycloak')\gexec
