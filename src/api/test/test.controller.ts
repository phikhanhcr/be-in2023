import { LikeType } from '@common/post/UserLke';
import { PostService } from '@common/post/post.service';
import Relation, { RelationStatus } from '@common/relation/Relation';
import { TokenService } from '@common/token/token.service';
import { UserService } from '@common/user/user.service';
import { NextFunction, Request, Response } from 'express';
export class TestController {
    static async common(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            // await PostService.like(
            //     { id: 1, name: 'hihi' },
            //     { post_id: '64b734ea3ebc292fa4e67aed', type: LikeType.POST },
            // );
            // const data = await Relation.findOne({
            //     sender_id: 1,
            //     // receiver_id: 2,
            //     // status: RelationStatus.PENDING,
            // }).populate({
            //     path: 'user_sender',
            //     select: 'name avatar',
            // });
            const data = await UserService.getProfileByUsername('sykhanhsky@gmail.com');
            // console.log({ data: data.user_sender });
            res.sendJson({
                message: 'Operation executed successfully!',
                data,
            });
        } catch (error) {
            next(error);
        }
    }
}
