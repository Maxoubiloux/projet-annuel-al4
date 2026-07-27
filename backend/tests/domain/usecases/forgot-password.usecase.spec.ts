import { ForgotPasswordUseCase } from '@domain/usecases/forgot-password.usecase'
import { IIamClient } from '@domain/repositories/IIamClient'

function createIamClientMock(overrides: Partial<IIamClient> = {}): IIamClient {
  return {
    login: jest.fn(),
    refresh: jest.fn(),
    register: jest.fn(),
    updateUser: jest.fn(),
    updatePassword: jest.fn(),
    sendPasswordResetEmail: jest.fn(async () => undefined),
    getTwoFactorStatus: jest.fn(async () => ({ enabled: false })),
    createTwoFactorSetup: jest.fn(),
    enableTwoFactor: jest.fn(),
    disableTwoFactor: jest.fn(),
    ...overrides,
  }
}

describe('ForgotPasswordUseCase', () => {
  it('should send a reset email for a valid address', async () => {
    const iamClient = createIamClientMock()
    const useCase = new ForgotPasswordUseCase(iamClient)

    const result = await useCase.execute('user@example.com')

    expect(result.isOk).toBe(true)
    expect(iamClient.sendPasswordResetEmail).toHaveBeenCalledWith('user@example.com')
  })

  it('should reject an invalid email without calling the IAM', async () => {
    const iamClient = createIamClientMock({ sendPasswordResetEmail: jest.fn() })
    const useCase = new ForgotPasswordUseCase(iamClient)

    const result = await useCase.execute('not-an-email')

    expect(result.isErr).toBe(true)
    if (result.isErr) {
      expect(result.error.code).toBe('VALIDATION_ERROR')
    }
    expect(iamClient.sendPasswordResetEmail).not.toHaveBeenCalled()
  })

  it('should not leak whether the IAM call failed (anti user-enumeration)', async () => {
    const iamClient = createIamClientMock({
      sendPasswordResetEmail: jest.fn(async () => { throw new Error('user not found') }),
    })
    const useCase = new ForgotPasswordUseCase(iamClient)

    const result = await useCase.execute('unknown@example.com')

    expect(result.isOk).toBe(true)
  })
})
