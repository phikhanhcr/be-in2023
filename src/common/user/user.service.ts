import { IAuthUser } from '@common/auth/auth.interface';
import User from './User';

export class UserService {
    static async getProfile(auth: IAuthUser): Promise<void> {
        // do something
        return await User.findById(auth.id);
    }
}
