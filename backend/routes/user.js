const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth } = require('../middleware/auth');
const { body } = require('express-validator');

// Validation middleware for profile updates
const validateProfileUpdate = [
  body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Le nom complet est requis')
];

// Protected routes (require authentication)
router.use(auth);

// Get current user profile
router.get('/profile/:id', userController.getProfile);

// Get all candidates
router.get('/candidates', userController.getCandidates);

// Update user profile
router.put('/profile/:id', validateProfileUpdate, userController.updateProfile);

// Get voter statistics
router.get('/stats', userController.getVoterStats);

// Verify user CNI and NCE
router.post('/verify', [
  body('cni')
    .trim()
    .notEmpty()
    .withMessage('Le numéro CNI est requis'),
  body('nce')
    .trim()
    .notEmpty()
    .withMessage('Le numéro NCE est requis')
], userController.verifyUser);

// Delete user (admin only)
router.delete('/:id', userController.deleteUser);

module.exports = router;
