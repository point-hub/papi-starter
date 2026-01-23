export interface IPasswordService {
  hash(password: string): Promise<string>
  verify(password: string, hash: string): Promise<boolean>
}

export const PasswordService: IPasswordService = {
  async hash(password) {
    return await Bun.password.hash(password);
  },
  async verify(password, hash) {
    return await Bun.password.verify(password, hash);
  },
};
