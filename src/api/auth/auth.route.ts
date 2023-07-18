import express from 'express';
import { AuthController } from './auth.controller';
import { validate } from 'express-validation';
import { signIn, signUp } from './auth.validator';

const router = express.Router();

router.post('/sign-in', validate(signIn, { context: true }), AuthController.signIn, AuthController.generateToken);

router.post('/sign-up', validate(signUp, { context: true }), AuthController.signUp, AuthController.generateToken);

export default router;
