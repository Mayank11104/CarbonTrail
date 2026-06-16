// Placeholder for Express routes
import { getUserProfile } from './users.controller';

export const userRoutes = (router: any) => {
  router.get('/profile', getUserProfile);
};
