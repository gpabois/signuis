import { Generated } from "kysely"

/**
 * Session table
 */
export interface Session {
    id: Generated<string>
    userId: string
    sessionToken: string
    expires: Date
}