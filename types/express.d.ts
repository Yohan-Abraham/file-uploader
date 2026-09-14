import type { userModel } from '../generated/prisma/models/user.js';

declare global {
  namespace Express {
    interface User extends userModel {}
  }
}

export {};
