import { PostStatus, PostType } from '@common/post/Post';
import { Joi, schema } from 'express-validation';
import { values } from 'lodash';

export const objectIdSchema = Joi.string().regex(/^[a-fA-F0-9]{24}$/);
const limitSchema = Joi.number().integer().positive().max(20).default(20);

export const getComments: schema = {
    body: Joi.object({
        parent_id: objectIdSchema.allow(null),
        post_id: objectIdSchema.required(),
    }),
};

export const createComment: schema = {
    body: Joi.object({
        parent_id: objectIdSchema.allow(null),
        content: Joi.string().min(1).required(),
        post_id: objectIdSchema.required(),
    }),
};
