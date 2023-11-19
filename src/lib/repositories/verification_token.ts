import { VerificationToken } from 'next-auth/adapters';


export interface IVerificationTokenRepository {
    insertVerificationToken(token: VerificationToken): Promise<void>;
}