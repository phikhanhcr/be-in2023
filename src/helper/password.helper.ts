import { NODE_ENV } from '@config/environment';
import { compareSync, hashSync } from 'bcryptjs';

const HASH_ROUNDS = NODE_ENV === 'development' ? 1 : 10;

export class PasswordHelper {
    /**
     * Generate password hash
     *
     * @param {string} password
     * @returns {string}
     * @memberOf PasswordHelper
     */
    static generateHash(password: string): string {
        return hashSync(password, HASH_ROUNDS);
    }

    /**
     * Check password
     *
     * @static
     * @param {string} password
     * @param {string} hash
     * @returns {boolean}
     * @memberOf PasswordHelper
     */
    static compareHash(password: string, hash: string): boolean {
        return compareSync(password, hash);
    }
}
