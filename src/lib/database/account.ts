import { GeneratedAlways } from "kysely"

/**
 * Account table
 */
export interface Account {
    id: GeneratedAlways<string>
    userId: string
    type: string
    provider: string
    providerAccountId: string
    refresh_token: string | null
    access_token: string | null
    expires_at: number | null
    token_type: string | null
    scope: string | null
    id_token: string | null
    session_state: string | null
}