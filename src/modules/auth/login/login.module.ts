import { Router } from 'express';
import { LoginController } from './login.controller';

const router = Router();

router.post('/', LoginController.login);

export const loginModule = {
  router
}; 