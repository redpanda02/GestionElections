const User = require('../models/User');

// Get user profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Get all candidates
exports.getCandidates = async (req, res) => {
  try {
    const candidates = await User.find({ role: 'candidate' })
      .select('-password')
      .sort({ createdAt: -1 });
    res.json(candidates);
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { fullName } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Only allow updating certain fields
    if (fullName) user.fullName = fullName;

    await user.save();

    res.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: user._id,
        fullName: user.fullName,
        cni: user.cni,
        nce: user.nce,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
 
// Get voter statistics
exports.getVoterStats = async (req, res) => {
  try {
    const totalVoters = await User.countDocuments({ role: 'voter' });
    const totalCandidates = await User.countDocuments({ role: 'candidate' });

    res.json({
      totalVoters,
      totalCandidates
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Verify user CNI and NCE
exports.verifyUser = async (req, res) => {
  try {

    const { cni, nce } = req.body;

    const user = await User.findOne({ 
      cni,
      nce
    }).select('-password');

    if (!user) {
      return res.status(404).json({ 
        message: 'Aucun utilisateur trouvé avec ces informations' 
      });
    }

    res.json({
      verified: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Delete user account (admin only)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Check if the requesting user is an admin (you'll need to implement admin role)
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Action non autorisée' });
    }

    await user.remove();
    res.json({ message: 'Utilisateur supprimé avec succès' });
  } catch (err) {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};