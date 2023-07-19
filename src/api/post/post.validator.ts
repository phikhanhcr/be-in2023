import { PostStatus, PostType } from '@common/post/Post';
import { Joi, schema } from 'express-validation';
import { values } from 'lodash';

export const objectIdSchema = Joi.string().regex(/^[a-fA-F0-9]{24}$/);

const limitSchema = Joi.number().integer().positive().max(20).default(20);

export const createPost: schema = {
    body: Joi.object({
        description: Joi.string().allow(null),
        images_url: Joi.array().items(Joi.string().allow(null)).min(1).max(10).required(),
        type: Joi.number()
            .valid(...values(PostType))
            .required(),
        status: Joi.number()
            .valid(...values(PostStatus))
            .required(),
        allow_comment: Joi.boolean().default(true),
    }),
};
