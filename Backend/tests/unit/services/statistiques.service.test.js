const { Parrainage, Candidat, Electeur } = require('../../../src/models');
const parrainageService = require('../../../src/services/parrainage.service');

jest.mock('../../../src/models', () => ({
  Parrainage: {
    findAll: jest.fn(),
    count: jest.fn()
  },
  Candidat: {
    findAll: jest.fn()
  },
  Electeur: {
    findAll: jest.fn()
  },
  sequelize: {
    fn: (fnName, col) => `${fnName}(${col})`,
    col: (colName) => colName
  }
}));

describe('Service Statistiques Parrainage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getStatistiquesGlobales', () => {
    it('devrait retourner les statistiques globales', async () => {
      Parrainage.findAll.mockResolvedValueOnce([
        { statut: 'VALIDE', total: '50' },
        { statut: 'EN_ATTENTE', total: '30' },
        { statut: 'REJETE', total: '20' }
      ]);

      const stats = await parrainageService.getStatistiquesGlobales();

      expect(stats).toHaveProperty('global');
      expect(stats.global).toHaveLength(3);
      expect(Parrainage.findAll).toHaveBeenCalled();
    });
  });

  describe('getStatistiquesParCandidat', () => {
    it('devrait retourner les statistiques par candidat', async () => {
      Parrainage.findAll.mockResolvedValueOnce([
        { 
          candidatId: 1,
          statut: 'VALIDE',
          total: '30',
          Candidat: { nomParti: 'Parti A' }
        },
        {
          candidatId: 2,
          statut: 'VALIDE',
          total: '20',
          Candidat: { nomParti: 'Parti B' }
        }
      ]);

      const stats = await parrainageService.getStatistiquesParCandidat(1);

      expect(stats).toBeDefined();
      expect(Parrainage.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { candidatId: 1 }
        })
      );
    });
  });
}); 