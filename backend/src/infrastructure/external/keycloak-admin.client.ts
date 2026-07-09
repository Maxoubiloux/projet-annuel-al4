import { IIamClient } from '@domain/repositories/IIamClient'

interface KeycloakTokenResponse {
  access_token: string
}

interface KeycloakUser {
  id: string
}

/**
 * Proxy vers l'API Admin Keycloak pour déclencher le flux natif de
 * réinitialisation de mot de passe ("UPDATE_PASSWORD" required action email).
 * Le backend ne gère jamais lui-même de mot de passe ou de token de reset :
 * Keycloak reste la seule source de vérité pour l'auth (cf. backend/CLAUDE.md).
 */
export class KeycloakAdminClient implements IIamClient {
  private readonly baseUrl = process.env.KEYCLOAK_URL ?? 'http://localhost:8080'
  private readonly realm = process.env.KEYCLOAK_REALM ?? 'moto-rental'
  private readonly clientId = process.env.KEYCLOAK_CLIENT_ID ?? ''
  private readonly clientSecret = process.env.KEYCLOAK_CLIENT_SECRET ?? ''

  private async getAdminToken(): Promise<string> {
    const res = await fetch(`${this.baseUrl}/realms/${this.realm}/protocol/openid-connect/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
      }),
    })

    if (!res.ok) {
      throw new Error('Impossible d\'obtenir un token admin Keycloak')
    }

    const data = (await res.json()) as KeycloakTokenResponse
    return data.access_token
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    const token = await this.getAdminToken()

    const searchRes = await fetch(
      `${this.baseUrl}/admin/realms/${this.realm}/users?email=${encodeURIComponent(email)}&exact=true`,
      { headers: { Authorization: `Bearer ${token}` } },
    )

    if (!searchRes.ok) {
      throw new Error('Recherche utilisateur Keycloak échouée')
    }

    const users = (await searchRes.json()) as KeycloakUser[]
    if (users.length === 0) {
      return
    }

    const actionRes = await fetch(
      `${this.baseUrl}/admin/realms/${this.realm}/users/${users[0].id}/execute-actions-email`,
      {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(['UPDATE_PASSWORD']),
      },
    )

    if (!actionRes.ok) {
      throw new Error('Envoi de l\'email de réinitialisation échoué')
    }
  }
}
