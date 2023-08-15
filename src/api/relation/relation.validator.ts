import { PostStatus, PostType } from '@common/post/Post';
import { Joi, schema } from 'express-validation';
import { values } from 'lodash';

export const objectIdSchema = Joi.string().regex(/^[a-fA-F0-9]{24}$/);
const limitSchema = Joi.number().integer().positive().max(20).default(20);

export const requestFollowing: schema = {
    body: Joi.object({
        receiver_id: Joi.number().required(),
    }),
};

export const acceptFollowing: schema = {
    body: Joi.object({
        sender_id: Joi.number().required(),
    }),
};

export const rejectFollowing: schema = {
    body: Joi.object({
        sender_id: Joi.number().required(),
    }),
};

export const unFollowing: schema = {
    body: Joi.object({
        receiver_id: Joi.number().required(),
    }),
};
