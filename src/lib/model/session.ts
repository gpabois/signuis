import { User } from ".";

export interface SessionAttributes {
    id: string,
    userId: string,
    sessionToken: string,
    expires: Date
}
export interface Session {
    id: string,
    sessionToken: string,
    expires: Date,
    user: User
};

export interface InsertSession {
    userId: string,
    sessionToken: string,
    expires: Date
};

export type FilterSession = Partial<SessionAttributes>;
export type UpdateSession = Partial<SessionAttributes> & Pick<Session, "id">;