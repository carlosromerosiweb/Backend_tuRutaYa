import { Router } from 'express';
import { registerModule } from './register/register.module';
import { loginModule } from './login/login.module';

const router = Router();

// Rutas
router.use('/register', registerModule.router);
router.use('/login', loginModule.router);

export const authModule = {
  router,
}; 