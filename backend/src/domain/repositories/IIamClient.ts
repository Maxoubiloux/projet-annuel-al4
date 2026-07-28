export interface IamUser {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string
  address: string
  zipCode: string
  city: string
  licenseCategory: 'A1' | 'A2' | 'A'
  licenseNumber: string
  createdAt: string
  roles: string[]
}

export interface IamAuthSession {
  accessToken: string
  refreshToken?: string
  expiresIn: number
  user: IamUser
}

export interface IIamClient {
  getUser(userId: string): Promise<IamUser>
  register(input: {
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
  }): Promise<IamAuthSession>
  updateUser(userId: string, input: {
    email: string
    phone: string
    address: string
    zipCode: string
    city: string
    licenseCategory: 'A1' | 'A2' | 'A'
  }): Promise<IamAuthSession>
  updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<void>
  sendPasswordResetEmail(email: string): Promise<void>
  getTwoFactorStatus(userId: string): Promise<{ enabled: boolean }>
  disableTwoFactor(userId: string): Promise<void>
}
