const request = require('supertest');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const app = require('../../../src/server');
const { Utilisateur, FichierElectoral } = require('../../../src/models');

describe('Routes Fichier Electoral', () => {
  let adminToken;
  let testFilePath;

  beforeAll(async () => {
    // Créer un utilisateur admin
    const admin = await Utilisateur.create({
      email: 'admin@example.com',
      motDePasse: await require('bcrypt').hash('Admin123!', 10),
      nom: 'Admin',
      prenom: 'Test',
      role: 'ADMIN',
      cni: '12345678',
      nce: '87654321'
    });

    // Générer le token admin
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@example.com',
        motDePasse: 'Admin123!'
      });

    adminToken = response.body.token;

    // Créer un fichier de test
    testFilePath = path.join(__dirname, '../../fixtures/test-electeurs.csv');
    const testData = 'numCarteElecteur,nom,prenom\n123456,Test,User';
    fs.writeFileSync(testFilePath, testData);
  });

  afterAll(() => {
    // Nettoyer le fichier de test
    if (fs.existsSync(testFilePath)) {
      fs.unlinkSync(testFilePath);
    }
  });

  describe('POST /api/v1/fichiers/upload', () => {
    it('devrait uploader un fichier avec succès', async () => {
      const fileBuffer = fs.readFileSync(testFilePath);
      const checksum = crypto
        .createHash('sha256')
        .update(fileBuffer)
        .digest('hex');

      const response = await request(app)
        .post('/api/v1/fichiers/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('fichier', testFilePath)
        .field('checksum', checksum)
        .expect(201);

      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.etatFichier).toBe('EN_TRAITEMENT');
    });

    it('devrait rejeter un fichier avec un mauvais checksum', async () => {
      const fakeChecksum = 'invalid_checksum';

      await request(app)
        .post('/api/v1/fichiers/upload')
        .set('Authorization', `Bearer ${adminToken}`)
        .attach('fichier', testFilePath)
        .field('checksum', fakeChecksum)
        .expect(400);
    });
  });
}); 