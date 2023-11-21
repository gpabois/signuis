import { faker } from "@faker-js/faker";
import { NewUser, User } from "../model";
import { Shared } from "../shared";

export namespace UserFixtures {
    export namespace ForServices {
        export function generateNewUser(args: Partial<NewUser>): NewUser {
            return {
                name: args.name || faker.internet.displayName(),
                password: args.password || faker.string.alphanumeric(100),
                email: args.email || faker.internet.email(),
                image: args.image || faker.image.avatarGitHub()
            }
        }

        export async function register(args: Partial<NewUser>, shared: Shared): Promise<User> {
            return await shared.services.account.registerUser(generateNewUser(args))
        }
    }
}