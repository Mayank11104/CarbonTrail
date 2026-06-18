import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../index';

describe('Users API', () => {
  describe('GET /api/users/profile', () => {
    
    it('should return 401 Unauthorized if no token is provided', async () => {
      const response = await request(app).get('/api/users/profile');
      
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'Unauthorized: No token provided'
      });
    });

    it('should return 401 Unauthorized if an invalid token is provided', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token');
      
      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'Unauthorized: Invalid token'
      });
    });

    it('should return 200 OK and user data if a valid token is provided', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer valid-mock-token');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        message: 'Profile retrieved successfully',
        data: {
          uid: 'mock-user-123',
          email: 'test@example.com'
        }
      });
    });

  });
});
