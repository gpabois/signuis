import {hash} from '@node-rs/argon2';

import { CreateUser, User, PatchUser, UserFilter, SensitiveUser, RegisterUser } from "../model";
import { IUserRepository} from "../repositories";
import { Signals } from "../signals";
import { Result, failed, invalid_form, success } from '../result';
import { Optional } from '../option';
import { Cursor } from '../utils/cursor';
import { RegisterSchema } from '../forms';
import { validation_error } from '../error';
import { ZodIssueCode } from 'zod';

/** 
 * Account service interface 
 */
export interface IAccountService {
    registerUser(user: RegisterUser): Promise<Result<User>>;
    createUser(newUser: CreateUser) : Promise<User>;
    patchUser(patch: PatchUser) : Promise<User>;
    deleteUser(id: string): Promise<void>;
    findUserBy(filter: UserFilter) : Promise<Optional<User>> ;
    findUsersBy(filter: UserFilter, cursor?: Cursor): Promise<Array<User>>;
}

/**
 * Generate a salt
 * @param byteSize 
 * @returns 
 */
function generateSalt(byteSize: number = 2): Buffer {
    return Buffer.copyBytesFrom(crypto.getRandomValues(new Uint8Array(2)))
}

async function encryptSecret(secret: string): Promise<string>{
    const salt = generateSalt(2)   
    return await hash(secret, {salt}) 
}

export function removeUserSensitiveInfos(sensitiveUser: SensitiveUser): User {
    const {password: _, ...user} = sensitiveUser;
    return user
}

/** Implementation of the account service interface */
export class AccountService  implements IAccountService {
    private users: IUserRepository;
    private signals: Signals;

    constructor({users, signals}: {users: IUserRepository, signals: Signals}) {
        this.users = users;
        this.signals = signals;
    }

    /**
     * Register a new user
     * @param newUser 
     * @returns 
     */
    async registerUser(args: RegisterUser) : Promise<Result<User>> {
        const validation = await RegisterSchema
            .superRefine(
                async ({name, email}, ctx) => {
                    const [existingName, existingEmail] = await Promise.all([this.findUserBy({name}), this.findUserBy({email})]);
                    if(existingEmail) {
                        ctx.addIssue({
                            code: ZodIssueCode.custom,
                            path: ['email'],
                            message: "Email déjà existant."
                        })
                    }
                    if(existingName) {
                        ctx.addIssue({
                            code: ZodIssueCode.custom,
                            path: ['name'],
                            message: "Nom déjà existant."
                        })
                    }
                })
            .safeParseAsync(args);
        
        if(!validation.success) {
            const error = validation.error;
            return failed(validation_error(error.issues))
        }

        const insert = {
            name: validation.data.name,
            email: validation.data.email,
            password: await encryptSecret(validation.data.password)
        };
        
        const [id] = await this.users.insert(insert);
        const sensitiveUser = (await this.users.findOneBy({id}))!;
        // Remove sensitive informations.
        const user = removeUserSensitiveInfos(sensitiveUser);
        this.signals.user_registered.send(this, user);
        return success(user);
    }

    /**
     * Create a new user
     * @param newUser 
     * @returns 
     */
    async createUser(newUser: CreateUser) : Promise<User> {
        if(newUser.password)
            newUser.password = await encryptSecret(newUser.password);
        
        const [id] = await this.users.insert(newUser);
        const sensitiveUser = (await this.users.findOneBy({id}))!;
        // Remove sensitive informations.
        const user = removeUserSensitiveInfos(sensitiveUser);
        this.signals.user_registered.send(this, user);
        return user;
    }

    async patchUser(patch: PatchUser) : Promise<User> {
        // Update the password
        if(patch.password)
            patch.password = await encryptSecret(patch.password);
        
        await this.users.update(patch);
        const {id} = patch;
        const sensitiveUser = (await this.users.findOneBy({id}))!;
        return removeUserSensitiveInfos(sensitiveUser);
    }
    
    async deleteUser(id: string) {
        const user = await this.users.findOneBy({id});
        if(user == undefined) return;
        await this.users.deleteBy({id});
        this.signals.user_deleted.send(this, user);
    }
    
    async findUserBy(filter: UserFilter) : Promise<Optional<User>> {
        const result = await this.users.findOneBy(filter);
        return result ? removeUserSensitiveInfos(result) : null;
    }

    async findUsersBy(filter: UserFilter, cursor?: Cursor): Promise<Array<User>> {
        const sensitiveUsers = await this.users.findBy(filter, cursor || {page: 0, size: 20})
        return sensitiveUsers.map(removeUserSensitiveInfos);
    }
}