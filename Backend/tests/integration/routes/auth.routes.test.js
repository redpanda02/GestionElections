const request = require('supertest');
const app = require('../../../src/server');
const { Utilisateur } = require('../../../src/models');

describe('Routes d\'authentification', () => {
  beforeEach(async () => {
    // Nettoyer la base de données avant chaque test
    await Utilisateur.destroy({ where: {} });
  });

  describe('POST /api/v1/auth/register', () => {
    it('devrait créer un nouvel utilisateur', async () => {
      const userData = {
        email: 'test@example.com',
        motDePasse: 'Password123!',
        nom: 'Test',
        prenom: 'User',
        role: 'ELECTEUR',
        cni: '12345678',
        nce: '87654321'
      };

      const response = await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('token');
      expect(response.body.data.email).toBe(userData.email);
    });

    it('devrait rejeter un email déjà utilisé', async () => {
      const userData = {
        email: 'test@example.com',
        motDePasse: 'Password123!',
        nom: 'Test',
        prenom: 'User',
        role: 'ELECTEUR',
        cni: '12345678',
        nce: '87654321'
      };

      await Utilisateur.create(userData);

      await request(app)
        .post('/api/v1/auth/register')
        .send(userData)
        .expect(400);
    });
  });

  describe('POST /api/v1/auth/login', () => {
    it('devrait connecter un utilisateur existant', async () => {
      const userData = {
        email: 'test@example.com',
        motDePasse: 'Password123!',
        nom: 'Test',
        prenom: 'User',
        role: 'ELECTEUR',
        cni: '12345678',
        nce: '87654321'
      };

      await request(app)
        .post('/api/v1/auth/register')
        .send(userData);

      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: userData.email,
          motDePasse: userData.motDePasse
        })
        .expect(200);

      expect(response.body).toHaveProperty('token');
    });

    it('devrait rejeter des identifiants invalides', async () => {
      await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'wrong@example.com',
          motDePasse: 'WrongPassword'
        })
        .expect(401);
    });
  });
}); 