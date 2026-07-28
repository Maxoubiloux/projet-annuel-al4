import { IamAuthSession, IamUser, IIamClient } from '@domain/repositories/IIamClient'

interface KeycloakTokenResponse {
  access_token: string
}

interface KeycloakUser {
  id: string
  email?: string
  firstName?: string
  lastName?: string
  createdTimestamp?: number
  attributes?: Record<string, string[]>
}

interface KeycloakCredential {
  id: string
  type: string
  userLabel?: string
}

async function readError(res: Response): Promise<string> {
  return await res.text().catch(() => res.statusText)
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

  private firstAttribute(user: KeycloakUser | null, key: string): string {
    return user?.attributes?.[key]?.[0] ?? ''
  }

  private async getUserDetails(userId: string): Promise<KeycloakUser | null> {
    if (!userId) return null

    const token = await this.getAdminToken()
    const res = await fetch(`${this.baseUrl}/admin/realms/${this.realm}/users/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) return null

    return (await res.json()) as KeycloakUser
  }

  private async findUserByEmail(token: string, email: string): Promise<KeycloakUser | null> {
    const res = await fetch(
      `${this.baseUrl}/admin/realms/${this.realm}/users?email=${encodeURIComponent(email)}&exact=true`,
      { headers: { Authorization: `Bearer ${token}` } },
    )

    if (!res.ok) return null

    const users = (await res.json()) as KeycloakUser[]
    return users[0] ?? null
  }

  private mapUser(user: KeycloakUser, roles: string[] = []): IamUser {
    return {
      id: user.id,
      email: user.email ?? '',
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      phone: this.firstAttribute(user, 'phone'),
      address: this.firstAttribute(user, 'address'),
      zipCode: this.firstAttribute(user, 'zipCode'),
      city: this.firstAttribute(user, 'city'),
      licenseCategory: (this.firstAttribute(user, 'licenseCategory') || 'A1') as 'A1' | 'A2' | 'A',
      licenseNumber: this.firstAttribute(user, 'licenseNumber'),
      createdAt: user.createdTimestamp ? new Date(user.createdTimestamp).toISOString() : new Date().toISOString(),
      roles,
    }
  }

  async getUser(userId: string): Promise<IamUser> {
    const user = await this.getUserDetails(userId)
    if (!user) {
      throw new Error('Utilisateur introuvable')
    }

    return this.mapUser(user)
  }

  async register(input: {
    email: string
    password: string
    firstName: string
    lastName: string
    phone: string
    address: string
    zipCode: string
    city: string
    licenseCategory: 'A1' | 'A2' | 'A'
    licenseNumber: string
  }): Promise<IamAuthSession> {
    const token = await this.getAdminToken()
    const createRes = await fetch(`${this.baseUrl}/admin/realms/${this.realm}/users`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: input.email,
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        enabled: true,
        emailVerified: true,
        attributes: {
          phone: [input.phone],
          address: [input.address],
          zipCode: [input.zipCode],
          city: [input.city],
          licenseCategory: [input.licenseCategory],
          licenseNumber: [input.licenseNumber],
        },
        credentials: [{ type: 'password', value: input.password, temporary: false }],
        realmRoles: ['customer'],
      }),
    })

    if (createRes.status === 409) {
      throw new Error('Un compte existe déjà avec cet email')
    }

    if (!createRes.ok) {
      throw new Error(`Création du compte impossible (${createRes.status}): ${await readError(createRes)}`)
    }

    const user = await this.findUserByEmail(token, input.email)
    if (user) {
      const updateRes = await fetch(`${this.baseUrl}/admin/realms/${this.realm}/users/${user.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: input.firstName,
          lastName: input.lastName,
          email: input.email,
          attributes: {
            phone: [input.phone],
            address: [input.address],
            zipCode: [input.zipCode],
            city: [input.city],
            licenseCategory: [input.licenseCategory],
            licenseNumber: [input.licenseNumber],
          },
        }),
      })

      if (!updateRes.ok) {
        throw new Error(`Mise à jour du profil impossible (${updateRes.status}): ${await readError(updateRes)}`)
      }
    }

    const createdUser = await this.findUserByEmail(token, input.email)
    return {
      accessToken: '',
      expiresIn: 0,
      user: createdUser
        ? this.mapUser(createdUser, ['customer'])
        : {
          id: '',
          email: input.email,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
          address: input.address,
          zipCode: input.zipCode,
          city: input.city,
          licenseCategory: input.licenseCategory,
          licenseNumber: input.licenseNumber,
          createdAt: new Date().toISOString(),
          roles: ['customer'],
        },
    }
  }

  async updateUser(userId: string, input: {
    email: string
    phone: string
    address: string
    zipCode: string
    city: string
    licenseCategory: 'A1' | 'A2' | 'A'
  }): Promise<IamAuthSession> {
    const token = await this.getAdminToken()
    const user = await this.getUserDetails(userId)

    if (!user) {
      throw new Error('Utilisateur introuvable')
    }

    const updateRes = await fetch(`${this.baseUrl}/admin/realms/${this.realm}/users/${userId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: user.firstName,
        lastName: user.lastName,
        email: input.email,
        attributes: {
          ...(user.attributes ?? {}),
          phone: [input.phone],
          address: [input.address],
          zipCode: [input.zipCode],
          city: [input.city],
          licenseCategory: [input.licenseCategory],
        },
      }),
    })

    if (!updateRes.ok) {
      throw new Error(`Mise à jour du compte impossible (${updateRes.status}): ${await readError(updateRes)}`)
    }

    return {
      accessToken: '',
      expiresIn: 0,
      user: this.mapUser({
        ...user,
        email: input.email,
        attributes: {
          ...(user.attributes ?? {}),
          phone: [input.phone],
          address: [input.address],
          zipCode: [input.zipCode],
          city: [input.city],
          licenseCategory: [input.licenseCategory],
        },
      }),
    }
  }

  async updatePassword(userId: string, _currentPassword: string, newPassword: string): Promise<void> {
    const token = await this.getAdminToken()
    const user = await this.getUserDetails(userId)

    if (!user?.email) {
      throw new Error('Utilisateur introuvable')
    }

    const res = await fetch(`${this.baseUrl}/admin/realms/${this.realm}/users/${userId}/reset-password`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'password', value: newPassword, temporary: false }),
    })

    if (!res.ok) {
      throw new Error(`Mise à jour du mot de passe impossible (${res.status}): ${await readError(res)}`)
    }
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

  private async getUserCredentials(token: string, userId: string): Promise<KeycloakCredential[]> {
    const res = await fetch(`${this.baseUrl}/admin/realms/${this.realm}/users/${userId}/credentials`, {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (!res.ok) {
      throw new Error('Lecture des identifiants Keycloak impossible')
    }

    return (await res.json()) as KeycloakCredential[]
  }

  async getTwoFactorStatus(userId: string): Promise<{ enabled: boolean }> {
    const token = await this.getAdminToken()
    const credentials = await this.getUserCredentials(token, userId)
    return {
      enabled: credentials.some(credential => credential.type === 'otp'),
    }
  }

  async disableTwoFactor(userId: string): Promise<void> {
    const token = await this.getAdminToken()
    const user = await this.getUserDetails(userId)
    if (!user) {
      throw new Error('Utilisateur introuvable')
    }

    const attributes = { ...(user.attributes ?? {}) }
    delete attributes.twoFactorEnabled
    delete attributes.twoFactorSecret

    const updateRes = await fetch(`${this.baseUrl}/admin/realms/${this.realm}/users/${userId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        attributes,
      }),
    })

    if (!updateRes.ok) {
      throw new Error(`Désactivation A2F impossible (${updateRes.status}): ${await readError(updateRes)}`)
    }

    const credentials = await this.getUserCredentials(token, userId)
    const otpCredentials = credentials.filter(credential => credential.type === 'otp')

    for (const credential of otpCredentials) {
      const res = await fetch(`${this.baseUrl}/admin/realms/${this.realm}/users/${userId}/credentials/${credential.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!res.ok) {
        throw new Error(`Suppression A2F impossible (${res.status}): ${await readError(res)}`)
      }
    }
  }
}
