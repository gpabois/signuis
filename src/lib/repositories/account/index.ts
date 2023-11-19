import { Account } from 'next-auth';

/**
 * Interface for user-related repository operations
 */
export interface IAccountRepository {
    insertAccount(account: Account): Promise<void>;
    deleteAccount(providerAccountId: Pick<Account, "provider" | "providerAccountId">): Promise<void>;
}