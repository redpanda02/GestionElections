const request = require('supertest');
const app = require('../../src/server');
const { 
  Utilisateur, 
  Candidat, 
  Electeur, 
  PeriodeParrainage,
  Parrainage 
} = require('../../src/models');

describe('Processus de parrainage E2E', () => {
  let token;
  let candidat;
  let electeur;
  let periode;

  beforeAll(async () => {
    // Créer un utilisateur admin
    const admin = await Utilisateur.create({
      email: 'admin@example.com',
      motDePasse: 'Admin123!',
      nom: 'Admin',
      prenom: 'Test',
      role: 'ADMIN'
    });

    // Se connecter et récupérer le token
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'admin@example.com',
        motDePasse: 'Admin123!'
      });

    token = response.body.token;

    // Créer une période de parrainage
    periode = await PeriodeParrainage.create({
      dateDebut: new Date(),
      dateFin: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      etat: 'OUVERT'
    });

    // Créer un candidat
    candidat = await Candidat.create({
      utilisateurId: admin.id,
      numCarteElecteur: 'CAND123456789',
      nomParti: 'Parti Test',
      slogan: 'Test Slogan'
    });

    // Créer un électeur
    electeur = await Electeur.create({
      utilisateurId: admin.id,
      numCarteIdentite: 'ID123456789',
      numCarteElecteur: 'ELEC123456789',
      dateNaissance: new Date('1990-01-01'),
      lieuNaissance: 'Test City',
      sexe: 'M',
      bureauVote: 'Bureau 1'
    });
  });

  describe('Processus complet de parrainage', () => {
    it('devrait permettre à un électeur de parrainer un candidat', async () => {
      // 1. Vérifier l'éligibilité de l'électeur
      const eligibiliteResponse = await request(app)
        .post('/api/v1/electeurs/verifier-eligibilite')
        .set('Authorization', `Bearer ${token}`)
        .send({
          numCarteElecteur: electeur.numCarteElecteur,
          numCarteIdentite: electeur.numCarteIdentite
        })
        .expect(200);

      expect(eligibiliteResponse.body.data.eligible).toBe(true);

      // 2. Créer un parrainage
      const parrainageResponse = await request(app)
        .post('/api/v1/parrainages')
        .set('Authorization', `Bearer ${token}`)
        .send({
          candidatId: candidat.id,
          electeurId: electeur.id,
          periodeId: periode.id
        })
        .expect(201);

      const codeVerification = parrainageResponse.body.data.codeVerification;

      // 3. Vérifier le parrainage
      await request(app)
        .post('/api/v1/parrainages/verifier')
        .set('Authorization', `Bearer ${token}`)
        .send({
          code: codeVerification
        })
        .expect(200);

      // 4. Vérifier que le parrainage est bien enregistré
      const parrainage = await Parrainage.findOne({
        where: {
          candidatId: candidat.id,
          electeurId: electeur.id
        }
      });

      expect(parrainage).toBeTruthy();
      expect(parrainage.statut).toBe('VALIDE');
    });
  });
}); 