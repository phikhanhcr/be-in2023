import { Joi, schema } from 'express-validation';

export const objectIdSchema = Joi.string().regex(/^[a-fA-F0-9]{24}$/);
const limitSchema = Joi.number().integer().positive().max(20).default(20);

export const getInfo: schema = {
    query: Joi.object({
        username: Joi.string().required(),
    }),
};

export const getInfoById: schema = {
    params: Joi.object({
        id: Joi.number().required(),
    }),
};
