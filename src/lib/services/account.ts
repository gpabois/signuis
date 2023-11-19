import {hash} from '@node-rs/argon2';

import { NewUser, User, PatchUser, UserFilter, SensitiveUser } from "../model";
import { IUserRepository} from "../repositories";
import { Signals } from "../signals";
import { Result } from 'postcss';
import { success } from '../result';
import { Optional } from '../option';
import { Cursor } from '../utils/cursor';

/** 
 * Account service interface 
 */
export interface IAccountService {
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
     * Create a new user
     * @param newUser 
     * @returns 
     */
    async registerUser(newUser: NewUser) : Promise<User> {
        if(newUser.password)
            newUser.password = await encryptSecret(newUser.password);
        
        const id = await this.users.insert(newUser);
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