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

export interface TwoFactorSetup {
  secret: string
  otpauthUrl: string
  qrCodeDataUrl: string
}

export interface IIamClient {
  login(email: string, password: string, otp?: string): Promise<IamAuthSession>
  refresh(refreshToken: string): Promise<IamAuthSession>
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
  createTwoFactorSetup(userId: string): Promise<TwoFactorSetup>
  enableTwoFactor(userId: string, secret: string, code: string): Promise<void>
  disableTwoFactor(userId: string): Promise<void>
}
