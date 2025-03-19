const authService = require('../../../src/services/auth.service');
const { Utilisateur } = require('../../../src/models');
const { AppError } = require('../../../src/middlewares/error.middleware');

// Mock du modèle Utilisateur
jest.mock('../../../src/models', () => ({
  Utilisateur: {
    findOne: jest.fn(),
    create: jest.fn()
  }
}));

describe('AuthService', () => {
  beforeEach(() => {
    // Réinitialiser les mocks avant chaque test
    jest.clearAllMocks();
  });

  describe('signup', () => {
    it('devrait créer un nouvel utilisateur avec succès', async () => {
      const userData = {
        email: 'test@example.com',
        motDePasse: 'Password123!',
        nom: 'Test',
        prenom: 'User',
        role: 'ELECTEUR'
      };

      Utilisateur.findOne.mockResolvedValue(null);
      Utilisateur.create.mockResolvedValue({
        id: 1,
        ...userData,
        motDePasse: 'hashedPassword'
      });

      const result = await authService.signup(userData);

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
      expect(Utilisateur.create).toHaveBeenCalledTimes(1);
    });

    it('devrait rejeter si l\'email existe déjà', async () => {
      const userData = {
        email: 'existing@example.com',
        motDePasse: 'Password123!'
      };

      Utilisateur.findOne.mockResolvedValue({ id: 1, email: userData.email });

      await expect(authService.signup(userData))
        .rejects
        .toThrow(AppError);
    });
  });

  describe('login', () => {
    it('devrait connecter un utilisateur avec succès', async () => {
      const credentials = {
        email: 'test@example.com',
        motDePasse: 'Password123!'
      };

      Utilisateur.findOne.mockResolvedValue({
        id: 1,
        email: credentials.email,
        motDePasse: await authService.hashPassword(credentials.motDePasse)
      });

      const result = await authService.login(
        credentials.email,
        credentials.motDePasse
      );

      expect(result).toHaveProperty('token');
      expect(result).toHaveProperty('user');
    });

    it('devrait rejeter si les identifiants sont invalides', async () => {
      const credentials = {
        email: 'test@example.com',
        motDePasse: 'WrongPassword'
      };

      Utilisateur.findOne.mockResolvedValue(null);

      await expect(authService.login(
        credentials.email,
        credentials.motDePasse
      )).rejects.toThrow(AppError);
    });
  });
}); 