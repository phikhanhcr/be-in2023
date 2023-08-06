import { AuthMiddleware } from './../auth/auth.middleware';
import express from 'express';
import { TestController } from './test.controller';

const router = express.Router();

router.get('/common', TestController.common);

export default router;
