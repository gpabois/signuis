import { GeneratedAlways } from "kysely";

/**
 * User table
 */
export interface User {
    id: GeneratedAlways<string>,
    name: string,
    email: string,
    emailVerified: Date | null,
    password: string | null,
    role: string,
    image: string | null
}