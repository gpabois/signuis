/**
 * Allows transaction across repositories
 */
export interface TransactionRunner<Tx extends Transaction>{
    /**
     * Run a transaction
     */
    runTransaction<R>(scope: (tx: Tx) => Promise<R>): Promise<R>;
}

/**
 * Represents a transaction.
 */
export interface Transaction {
    /**
     * Commit the transaction
     */
    commit(): Promise<void>
    /**
     * Rollback the transaction
     */
    rollback(): Promise<void>
}