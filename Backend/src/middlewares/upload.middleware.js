const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { AppError } = require('./error.middleware');
const logger = require('../config/logger');

// Configuration du stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'uploads/');
  },
  filename: (req, file, cb) => {
    // Générer un nom de fichier unique
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

// Filtre des fichiers
const fileFilter = (req, file, cb) => {
  // Définir les types de fichiers autorisés
  const allowedTypes = process.env.ALLOWED_FILE_TYPES
    ? process.env.ALLOWED_FILE_TYPES.split(',')
    : ['text/csv', 'application/vnd.ms-excel'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError(`Type de fichier non autorisé. Types acceptés: ${allowedTypes.join(', ')}`, 400), false);
  }
};

// Configuration de Multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB par défaut
  }
});

// Middleware de gestion des erreurs Multer
const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return next(new AppError('Fichier trop volumineux', 400));
    }
    return next(new AppError(err.message, 400));
  }
  
  if (err) {
    return next(err);
  }
  
  next();
};

// Middleware de validation du checksum
const validateChecksum = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Aucun fichier n\'a été uploadé', 400));
    }

    const fileBuffer = await fs.promises.readFile(req.file.path);
    const calculatedChecksum = crypto
      .createHash('sha256')
      .update(fileBuffer)
      .digest('hex');

    if (calculatedChecksum !== req.body.checksum) {
      await fs.promises.unlink(req.file.path); // Supprimer le fichier
      return next(new AppError('Le checksum du fichier ne correspond pas', 400));
    }

    req.fileChecksum = calculatedChecksum;
    next();
  } catch (error) {
    logger.error('Erreur lors de la validation du checksum:', error);
    next(new AppError('Erreur lors de la validation du fichier', 500));
  }
};

module.exports = {
  upload,
  handleUploadError,
  validateChecksum
}; 