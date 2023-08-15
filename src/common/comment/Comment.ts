import mongoose, { Document, Schema } from 'mongoose';
import { ITimestamp } from '@common/timestamp.interface';
import moment from 'moment-timezone';
import { DEFAULT_USER_AVATAR } from '@config/user';

export interface ICommentResponse {
    id: string;
    user_id: number;
    user_name: string;
    user_avatar: string;
    content: string;
    parent_id: string;
    parent_name: string;
    right: number;
    left: number;
    post_id: string;
    is_deleted: boolean;
    level: number;
    reply_count: number;
    like_count: number;
    created_at: number;
}

export interface IComment extends Document, ITimestamp {
    _id: mongoose.Types.ObjectId;
    user_id: number;
    user_name: string;
    user_avatar: string;
    content: string;
    parent_id: mongoose.Types.ObjectId;
    parent_name: string;
    right: number;
    left: number;
    level: number;
    post_id: mongoose.Types.ObjectId;
    is_deleted: boolean;
    reply_count: number;
    created_at: Date;
    like_count: number;

    transform(): ICommentResponse;
}

const CommentSchema: Schema = new Schema(
    {
        user_id: { type: Number, required: true },
        user_name: { type: String, trim: true, default: null },
        user_avatar: { type: String, trim: true, default: null },
        content: { type: String, trim: true, require: true },
        parent_id: { type: mongoose.Types.ObjectId, default: null },
        parent_name: { type: String, default: null },
        post_id: { type: mongoose.Types.ObjectId, required: true },
        level: { type: Number, default: null },
        right: { type: Number, default: null },
        left: { type: Number, default: null },
        is_deleted: { type: Boolean, default: false },
        reply_count: { type: Number, default: 0 },
        like_count: { type: Number, default: 0 },
    },
    {
        timestamps: {
            createdAt: 'created_at',
            updatedAt: 'updated_at',
        },
    },
);

CommentSchema.method({
    transform(): ICommentResponse {
        return {
            id: this._id.toHexString(),
            user_id: this.user_id,
            user_name: this.user_name ? this.user_name : 'Anonymous',
            user_avatar: this.user_avatar ? this.user_avatar : DEFAULT_USER_AVATAR,
            content: this.content,
            parent_id: this.parent_id ? this.parent_id.toHexString() : null,
            parent_name: this.parent_name ? this.parent_name : null,
            right: this.right,
            left: this.left,
            level: this.level,
            post_id: this.post_id ? this.post_id.toHexString() : null,
            is_deleted: this.is_deleted,
            reply_count: this.reply_count,
            created_at: moment(this.created_at).unix(),
            like_count: this.like_count,
        };
    },
});

CommentSchema.index({ post_id: 1 });
CommentSchema.index({ parent_id: 1, level: 1 });
// cho nay nen danh index the nao thi hoply
CommentSchema.index({ left: 1 });
CommentSchema.index({ right: 1 });

export default mongoose.model<IComment>('Comment', CommentSchema);
