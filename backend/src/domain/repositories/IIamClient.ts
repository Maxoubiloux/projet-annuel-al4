export interface IIamClient {
  sendPasswordResetEmail(email: string): Promise<void>
}
