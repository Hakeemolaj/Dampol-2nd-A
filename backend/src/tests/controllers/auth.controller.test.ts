// Test suite for AuthController
import request from 'supertest';
import express from 'express';
import { register, login, logout } from '@/controllers/authController';
import { AuthService } from '@/services/authService';
import {
  mockUser,
  mockSession,
  mockProfile,
  resetAllMocks,
} from '../setup/supabase-mock';

// Mock the AuthService
jest.mock('@/services/authService');
const mockAuthService = AuthService as jest.Mocked<typeof AuthService>;

// Create test app
const app = express();
app.use(express.json());
app.post('/register', register);
app.post('/login', login);
app.post('/logout', logout);

describe('AuthController', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  describe('POST /register', () => {
    const validRegistrationData = {
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      phone: '+639123456789',
    };

    it('should register user successfully', async () => {
      const mockResult = {
        user: mockUser,
        session: mockSession,
        profile: mockProfile,
      };

      mockAuthService.register.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/register')
        .send(validRegistrationData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();
      expect(response.body.data.user.email).toBe(validRegistrationData.email);
      expect(mockAuthService.register).toHaveBeenCalledWith(validRegistrationData);
    });

    it('should handle registration without session (email confirmation)', async () => {
      const mockResult = {
        user: mockUser,
        session: null, // No session means email confirmation required
        profile: mockProfile,
      };

      mockAuthService.register.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/register')
        .send(validRegistrationData)
        .expect(201);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toContain('check your email');
      expect(response.body.data.user.email).toBe(validRegistrationData.email);
    });

    it('should handle registration errors', async () => {
      mockAuthService.register.mockRejectedValue(new Error('Email already exists'));

      const response = await request(app)
        .post('/register')
        .send(validRegistrationData)
        .expect(500);

      expect(response.body.status).toBe('error');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        email: 'test@example.com',
        // Missing password and other required fields
      };

      const response = await request(app)
        .post('/register')
        .send(invalidData)
        .expect(500);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /login', () => {
    const validLoginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      const mockResult = {
        user: mockUser,
        session: mockSession,
        profile: mockProfile,
      };

      mockAuthService.login.mockResolvedValue(mockResult);

      const response = await request(app)
        .post('/login')
        .send(validLoginData)
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.token).toBeDefined();
      expect(response.body.data.user.email).toBe(validLoginData.email);
      expect(mockAuthService.login).toHaveBeenCalledWith(validLoginData);
    });

    it('should handle invalid credentials', async () => {
      mockAuthService.login.mockRejectedValue(new Error('Invalid email or password'));

      const response = await request(app)
        .post('/login')
        .send(validLoginData)
        .expect(500);

      expect(response.body.status).toBe('error');
    });

    it('should validate required fields', async () => {
      const invalidData = {
        email: 'test@example.com',
        // Missing password
      };

      const response = await request(app)
        .post('/login')
        .send(invalidData)
        .expect(500);

      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /logout', () => {
    it('should logout user successfully', async () => {
      mockAuthService.logout.mockResolvedValue();

      const response = await request(app)
        .post('/logout')
        .expect(200);

      expect(response.body.status).toBe('success');
      expect(response.body.message).toBe('Logged out successfully');
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should handle logout errors', async () => {
      mockAuthService.logout.mockRejectedValue(new Error('Logout failed'));

      const response = await request(app)
        .post('/logout')
        .expect(500);

      expect(response.body.status).toBe('error');
    });
  });
});

describe('AuthController Integration', () => {
  beforeEach(() => {
    resetAllMocks();
    jest.clearAllMocks();
  });

  it('should handle complete registration and login flow', async () => {
    const registrationData = {
      email: 'integration@example.com',
      password: 'password123',
      firstName: 'Integration',
      lastName: 'Test',
      phone: '+639123456789',
    };

    const loginData = {
      email: registrationData.email,
      password: registrationData.password,
    };

    // Mock registration
    const mockRegisterResult = {
      user: { ...mockUser, email: registrationData.email },
      session: mockSession,
      profile: { ...mockProfile, first_name: registrationData.firstName },
    };

    mockAuthService.register.mockResolvedValue(mockRegisterResult);

    // Test registration
    const registerResponse = await request(app)
      .post('/register')
      .send(registrationData)
      .expect(201);

    expect(registerResponse.body.status).toBe('success');
    const registrationToken = registerResponse.body.token;

    // Mock login
    const mockLoginResult = {
      user: { ...mockUser, email: registrationData.email },
      session: mockSession,
      profile: { ...mockProfile, first_name: registrationData.firstName },
    };

    mockAuthService.login.mockResolvedValue(mockLoginResult);

    // Test login
    const loginResponse = await request(app)
      .post('/login')
      .send(loginData)
      .expect(200);

    expect(loginResponse.body.status).toBe('success');
    const loginToken = loginResponse.body.token;

    // Tokens should be valid
    expect(registrationToken).toBeDefined();
    expect(loginToken).toBeDefined();

    // Mock logout
    mockAuthService.logout.mockResolvedValue();

    // Test logout
    const logoutResponse = await request(app)
      .post('/logout')
      .expect(200);

    expect(logoutResponse.body.status).toBe('success');
  });
});
