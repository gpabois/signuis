import {verify} from '@node-rs/argon2';
import { ISessionRepository, IUserRepository } from "../repositories";
import { Signals } from "../signals";
import { InsertSession, Session, User } from '../model';
import { Result } from '@/lib/result';
import { invalid_credentials, validation_error } from '../error';
import { failed, success } from '../result';
import { Optional } from '../option';
import { removeUserSensitiveInfos } from './account';
import { Maybe } from '../maybe';
import { CredentialsSchema } from '../forms';
import { NEVER, ZodIssueCode } from 'zod';

async function verifySecret(secret: string, against: string): Promise<boolean> {
    return await verify(against, secret)
}

function generateRandomToken(byteSize: number = 32): Buffer {
    return Buffer.copyBytesFrom(crypto.getRandomValues(new Uint8Array(byteSize)))
}

export type Credantials = {
    nameOrEmail: string,
    password: string   
}


export interface IAuthenticationService {
    /**
     * Sign in with simple credentials
     * 
     * @param nameOrEmail 
     * @param password 
     * @returns 
     */
    signInWithCredentials(credentials: Credantials): Promise<Result<Session>>;
    /**
     * Sign out from the session
     * @param sessionToken 
     * @returns 
     */
    signOut(sessionToken: string): Promise<void>;
    /**
     * Authenticate the session token
     * @param sessionToken 
     * @returns 
     */
    check(sessionToken: Maybe<string>): Promise<Session|undefined> 
}

export type AuthenticationServiceArgs = {users: IUserRepository, sessions: ISessionRepository, signals: Signals};

export class AuthenticationService implements IAuthenticationService {
    private users: IUserRepository;
    private sessions: ISessionRepository;
    private signals: Signals;

    constructor({users, sessions, signals}: AuthenticationServiceArgs) {
        this.users = users;
        this.sessions = sessions;
        this.signals = signals;
    }

    async signInWithCredentials(credantials: Credantials): Promise<Result<Session>> {
        const validation = await CredentialsSchema
        .transform(async ({nameOrEmail, password}) => await this.checkCredentials(nameOrEmail, password))
        .superRefine((user, ctx) => {
            if(!user) {
                ctx.addIssue({code: ZodIssueCode.custom, message: "Compte inexistant ou mot de passe invalide.", fatal: true})
                return NEVER;
            }
        })
        .safeParseAsync(credantials);
        
        if(validation.success == false) 
            return failed(validation_error(validation.error.issues));

        const session = await this.createSession(validation.data!.id);
        await this.signals.user_signed_in.send(this, session);
        return success(session);
    }

    async signOut(sessionToken: string): Promise<void> {
        const session = await this.sessions.findOneBy({sessionToken});
        if(session === null) return;
        this.sessions.deleteBy({sessionToken});
        await this.signals.user_signed_out.send(this, session);
    }

    async check(sessionToken: Maybe<string>): Promise<Session|undefined> {
        if(!sessionToken) return undefined;
        
        const session = await this.sessions.findOneBy({sessionToken});
        if(session === null) return undefined;
        // Expired...
        if(session.expires < new Date()) {
            this.sessions.deleteBy({id: session.id});
            return undefined;
        }
        return session;
    }

    /**
     * Check if the name/email and password corresponds to a user
     * @param nameOrEmail 
     * @param password 
     * @returns the user if it exists and the password match.
     */
    private async checkCredentials(nameOrEmail: string, password: string): Promise<Optional<User>> {
        const sensitiveUser = await this.users.findOneBy({nameOrEmail})
        if(!sensitiveUser) return null;
        const isOk = await verifySecret(password, sensitiveUser.password!);
        if(!isOk) return null;
        const {password: _, ...user} = sensitiveUser;
        return removeUserSensitiveInfos(sensitiveUser);
    }

    /**
     * Creates a new session for the user
     */
    private async createSession(userId: string): Promise<Session> {
        const insertSession: InsertSession = {
            userId,
            sessionToken: generateRandomToken().toString("base64"),
            // Expires in 24h
            expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
        }
        const [id] = await this.sessions.insert(insertSession);
        return (await this.sessions.findOneBy({id}))!;
    }
    
}