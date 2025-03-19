const jwt = require('jsonwebtoken');
const { protect, restrictTo } = require('../../../src/middlewares/auth.middleware');
const { Utilisateur } = require('../../../src/models');

jest.mock('../../../src/models', () => ({
  Utilisateur: {
    findByPk: jest.fn()
  }
}));

describe('Middleware d\'authentification', () => {
  let mockReq;
  let mockRes;
  let mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
      user: null
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    mockNext = jest.fn();
  });

  describe('protect', () => {
    it('devrait autoriser l\'accès avec un token valide', async () => {
      const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET);
      mockReq.headers.authorization = `Bearer ${token}`;

      Utilisateur.findByPk.mockResolvedValueOnce({
        id: 1,
        email: 'test@example.com'
      });

      await protect(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
      expect(mockReq.user).toBeDefined();
    });

    it('devrait rejeter l\'accès sans token', async () => {
      await protect(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 401
        })
      );
    });
  });

  describe('restrictTo', () => {
    it('devrait autoriser l\'accès pour le bon rôle', () => {
      mockReq.user = { role: 'ADMIN' };
      const middleware = restrictTo('ADMIN');

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalled();
    });

    it('devrait rejeter l\'accès pour un rôle non autorisé', () => {
      mockReq.user = { role: 'ELECTEUR' };
      const middleware = restrictTo('ADMIN');

      middleware(mockReq, mockRes, mockNext);

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          statusCode: 403
        })
      );
    });
  });
}); 