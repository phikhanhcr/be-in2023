import {
    IAcceptRequest,
    IRejectRequest,
    IRequestFollowing,
    ITargetUserRequest,
    IUnFollowRequest,
} from '@api/relation/relation.request';
import { IAuthUser } from '@common/auth/auth.interface';
import Relation, { IRelation, RelationStatus } from './Relation';
import User from '@common/user/User';
import { APIError } from '@common/error/api.error';
import httpStatus from 'http-status';
import { ErrorCode } from '@config/errors';

export class RelationService {
    static async request(auth: IAuthUser, req: IRequestFollowing): Promise<void> {
        // do something
        let relation = await Relation.findOne({ sender_id: auth.id, receiver_id: req.receiver_id });
        if (relation) {
            // throw error
            throw new APIError({
                message: `auth.login.${httpStatus.BAD_REQUEST}.${ErrorCode.RELATION_ALREADY_EXISTS}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.RELATION_ALREADY_EXISTS,
            });
        }
        // if b is private account, pending, if not status = following

        const receiver = await User.findOne({ id: req.receiver_id });
        if (!receiver) {
            // throw error
            throw new APIError({
                message: `auth.login.${httpStatus.BAD_REQUEST}.${ErrorCode.RELATION_NOT_FOUND}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.RELATION_NOT_FOUND,
            });
        }

        const status = receiver.is_private ? RelationStatus.PENDING : RelationStatus.FOLLOWING;

        relation = await Relation.create({
            sender_id: auth.id,
            receiver_id: req.receiver_id,
            status,
        });

        // event notification for receiver B
    }

    // receiver is private account
    static async accept(auth: IAuthUser, req: IAcceptRequest): Promise<void> {
        // do something
        let relation = await Relation.findOne({
            receiver_id: auth.id,
            sender_id: req.sender_id,
            status: RelationStatus.PENDING,
        });
        if (!relation) {
            // throw error
            throw new APIError({
                message: `auth.login.${httpStatus.BAD_REQUEST}.${ErrorCode.RELATION_NOT_FOUND}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.RELATION_NOT_FOUND,
            });
        }

        relation = await Relation.findOneAndUpdate(
            { receiver_id: auth.id, sender_id: req.sender_id, status: RelationStatus.PENDING },
            { status: RelationStatus.FOLLOWING },
            { new: true },
        );

        // event notification for sender
    }

    // receiver is private account
    static async reject(auth: IAuthUser, req: IRejectRequest): Promise<void> {
        // do something
        let relation = await Relation.findOne({
            receiver_id: auth.id,
            sender_id: req.sender_id,
            status: RelationStatus.PENDING,
        });
        if (!relation) {
            // throw error
            throw new APIError({
                message: `auth.login.${httpStatus.BAD_REQUEST}.${ErrorCode.RELATION_NOT_FOUND}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.RELATION_NOT_FOUND,
            });
        }

        relation = await Relation.findOneAndUpdate(
            { receiver_id: auth.id, sender_id: req.sender_id, status: RelationStatus.PENDING },
            { status: RelationStatus.REJECT },
            { new: true },
        );

        // event notification for sender
    }

    // IUnFollowRequest
    static async unFollow(auth: IAuthUser, req: IUnFollowRequest): Promise<void> {
        const relation = await Relation.findOneAndUpdate(
            { sender_id: auth.id, receiver_id: req.receiver_id, status: RelationStatus.FOLLOWING },
            { status: RelationStatus.NONE },
            { new: true },
        );
        if (!relation) {
            throw new APIError({
                message: `auth.login.${httpStatus.BAD_REQUEST}.${ErrorCode.RELATION_NOT_FOUND}`,
                status: httpStatus.BAD_REQUEST,
                errorCode: ErrorCode.RELATION_NOT_FOUND,
            });
        }
    }

    // IUnFollowRequest
    static async listFollowing(auth: IAuthUser, req: ITargetUserRequest): Promise<IRelation[]> {
        // pagination or not
        const targetUserId = req.user_id || auth.id;

        const relations = await Relation.find({ sender_id: targetUserId, status: RelationStatus.FOLLOWING }).populate({
            path: 'user_receiver',
        });
        // find relation between and receiver_id
        return relations;
    }

    static async listFollower(auth: IAuthUser, req: ITargetUserRequest): Promise<IRelation[]> {
        // pagination or not
        const targetUserId = req.user_id || auth.id;

        const relations = await Relation.find({ receiver_id: targetUserId, status: RelationStatus.FOLLOWING }).populate(
            {
                path: 'user_sender',
            },
        );
        // find relation between and sender_id
        return relations;
    }
}
