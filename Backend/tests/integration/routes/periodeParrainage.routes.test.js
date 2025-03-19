const request = require('supertest');
const app = require('../../../src/server');
const { Utilisateur, PeriodeParrainage } = require('../../../src/models');

describe('Routes Période Parrainage', () => {
  let adminToken;

  beforeAll(async () => {
    const admin = await Utilisateur.create({
      email: 'admin@example.com',
      motDePasse: await require('bcrypt').hash('Admin123!', 10),
      nom: 'Admin',
      prenom: 'Test',
      role: 'ADMIN',
      cni: '12345678',
      nce: '87654321'
    });

    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@example.com',
        motDePasse: 'Admin123!'
      });

    adminToken = response.body.token;
  });

  describe('POST /api/v1/periodes', () => {
    it('devrait créer une nouvelle période', async () => {
      const periodeData = {
        dateDebut: new Date(Date.now() + 24 * 60 * 60 * 1000), // Demain
        dateFin: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // Dans 10 jours
      };

      const response = await request(app)
        .post('/api/v1/periodes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(periodeData)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.etat).toBe('FERME');
    });

    it('devrait rejeter une période chevauchant une existante', async () => {
      const periode1 = {
        dateDebut: new Date(Date.now() + 24 * 60 * 60 * 1000),
        dateFin: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
      };

      await PeriodeParrainage.create(periode1);

      const periode2 = {
        dateDebut: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        dateFin: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      };

      await request(app)
        .post('/api/v1/periodes')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(periode2)
        .expect(400);
    });
  });

  describe('PATCH /api/v1/periodes/:id/ouvrir', () => {
    it('devrait ouvrir une période', async () => {
      const periode = await PeriodeParrainage.create({
        dateDebut: new Date(),
        dateFin: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        etat: 'FERME'
      });

      const response = await request(app)
        .patch(`/api/v1/periodes/${periode.id}/ouvrir`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.data.etat).toBe('OUVERT');
    });
  });
}); 