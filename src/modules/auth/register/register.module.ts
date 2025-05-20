import { Router } from 'express';
import { RegisterController } from './register.controller';

const router = Router();

router.post('/', RegisterController.register);

export const registerModule = {
  router
}; 