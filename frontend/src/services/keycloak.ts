import Keycloak from 'keycloak-js';

const keycloak = new Keycloak({
  url: process.env.NEXT_PUBLIC_KEYCLOAK_URL ?? 'http://localhost:8080',
  realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM ?? 'moto-rental',
  clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID ?? 'moto-rental-frontend',
});

export default keycloak;
