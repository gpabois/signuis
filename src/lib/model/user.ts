import { AdapterUser } from "next-auth/adapters"
import { Patch } from "../repositories";
import { Account } from "next-auth";

/**
 * Represents a user.
 */
export interface UserAttributes extends AdapterUser {
    id: string,
    // User's name
    name: string,
    // Password as PHC 
    password: string | null,
    // Role of the user
    role: string
}   

export type UserId = UserAttributes["id"];
export interface RegisterUser {
    name: string,
    email: string,
    password: string,
    confirmPassword: string
} 
export type CreateUser = Omit<UserAttributes, "id" | "emailVerified" | "role">;
export type InsertUser  = CreateUser;
export type PatchUser = Patch<UserAttributes>;
export type UpdateUser = Patch<UserAttributes>
export type DeleteUserFilter = UserFilter & Omit<UserFilter, "nameOrEmail" & "provider" & "providerAccountId">
// User model with sensitive infos
export type SensitiveUser = UserAttributes
export type User = Omit<UserAttributes, "password">
export type UserFilter  = Partial<UserAttributes> 
    & Partial<{providerAccountId: Pick<Account, "provider" | "providerAccountId">}>
    & Partial<{nameOrEmail: string}>;