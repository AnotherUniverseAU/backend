import { Request } from 'express';

// If UserDocument is your type for a user, import it
import { UserDocument } from './path-to-user-document-type';

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}
