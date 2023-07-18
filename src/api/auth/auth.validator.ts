import { Joi, schema } from 'express-validation';
import { values } from 'lodash';

export const objectIdSchema = Joi.string().regex(/^[a-fA-F0-9]{24}$/);

const limitSchema = Joi.number().integer().positive().max(20).default(20);

export const signIn: schema = {
    body: Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required(),
    }),
};

export const signUp: schema = {
    body: Joi.object({
        email: Joi.string().email().required(),
        username: Joi.string().required(),
        password1: Joi.string().required(),
        password2: Joi.string().required(),
    }),
};
