const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Vérification du type MIME
  const allowedMimes = ['text/csv', 'application/vnd.ms-excel'];
  if (!allowedMimes.includes(file.mimetype)) {
    cb(new ApiError(400, 'file.invalidType', ['Seuls les fichiers CSV sont acceptés']));
    return;
  }

  // Vérification de la taille (max 10MB)
  if (req.headers['content-length'] > 10 * 1024 * 1024) {
    cb(new ApiError(400, 'file.tooLarge', ['Le fichier ne doit pas dépasser 10MB']));
    return;
  }

  cb(null, true);
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

module.exports = {
  uploadFichierElectoral: upload.single('fichierElectoral'),
  
  validateFileChecksum: async (req, res, next) => {
    try {
      if (!req.file) {
        throw new ApiError(400, 'file.required');
      }

      const providedChecksum = req.body.checksum;
      if (!providedChecksum) {
        throw new ApiError(400, 'file.checksumRequired');
      }

      const fileBuffer = await fs.promises.readFile(req.file.path);
      const calculatedChecksum = crypto
        .createHash('sha256')
        .update(fileBuffer)
        .digest('hex');

      if (providedChecksum !== calculatedChecksum) {
        await fs.promises.unlink(req.file.path);
        throw new ApiError(400, 'file.checksumMismatch');
      }

      next();
    } catch (error) {
      next(error);
    }
  }
}; 