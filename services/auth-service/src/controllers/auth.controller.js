const jwt = require('jsonwebtoken');
const axios = require('axios');
const { AppError } = require('../utils/errorUtils');
const User = require('../models/user.model');
const config = require('../config/config');

// URL du service de notifications
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3004';

// Fonction pour envoyer un email de bienvenue (non-bloquante)
const sendWelcomeEmail = async (user) => {
  try {
    await axios.post(`${NOTIFICATION_SERVICE_URL}/api/notifications/welcome`, {
      email: user.email,
      first_name: user.firstName,
      role: user.role
    });
    console.log(`✅ Email de bienvenue envoyé à ${user.email}`);
  } catch (error) {
    console.error(`❌ Erreur envoi email bienvenue: ${error.message}`);
    // Ne pas bloquer l'inscription si l'email échoue
  }
};

// Générer un token JWT
const signToken = (id, role) => {
  return jwt.sign({ id, role }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

// Créer et envoyer un token
const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id, user.role);
  
  // Options du cookie
  const cookieOptions = {
    expires: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 jours
    ),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
  };

  // Envoyer le token dans un cookie
  res.cookie('jwt', token, cookieOptions);

  // Ne pas afficher le mot de passe dans la réponse
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};

// Inscription d'un nouvel utilisateur
exports.signup = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName, phone, role = 'tenant' } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new AppError('Un utilisateur avec cet email existe déjà', 400);
    }

    // Créer un nouvel utilisateur
    const newUser = await User.create({
      email,
      password,
      firstName,
      lastName,
      phone,
      role,
    });

    // Envoyer l'email de bienvenue (non-bloquant)
    sendWelcomeEmail(newUser);

    // Connecter automatiquement l'utilisateur après l'inscription
    createSendToken(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};

// Connexion d'un utilisateur
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'email et le mot de passe sont fournis
    if (!email || !password) {
      throw new AppError('Veuillez fournir un email et un mot de passe', 400);
    }

    // Vérifier si l'utilisateur existe et que le mot de passe est correct
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password, user.password))) {
      throw new AppError('Email ou mot de passe incorrect', 401);
    }

    // Vérifier si le compte est actif (banni)
    if (!user.isActive) {
      throw new AppError('Votre compte a été suspendu par un administrateur. Contactez le support pour plus d\'informations.', 403);
    }

    // Si tout est bon, envoyer le token
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Récupérer l'utilisateur connecté
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return next(new AppError('Aucun utilisateur trouvé avec cet ID', 404));
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// Récupérer un utilisateur par son ID (pour les autres services)
exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'Utilisateur non trouvé'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// Déconnexion (définir le cookie à 'loggedout')
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

// Middleware pour protéger les routes
exports.protect = async (req, res, next) => {
  try {
    // 1) Récupérer le token et vérifier s'il existe
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt) {
      token = req.cookies.jwt;
    }

    if (!token) {
      throw new AppError(
        'Vous n\'êtes pas connecté. Veuillez vous connecter pour accéder à cette ressource.',
        401
      );
    }

    // 2) Vérifier le token
    const decoded = await jwt.verify(token, config.jwtSecret);

    // 3) Vérifier si l'utilisateur existe toujours
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      throw new AppError(
        "L'utilisateur associé à ce token n'existe plus.",
        401
      );
    }

    // 4) Vérifier si l'utilisateur a changé son mot de passe après l'émission du token
    // (à implémenter si nécessaire)

    // Donner accès à la route protégée
    req.user = currentUser;
    res.locals.user = currentUser;
    next();
  } catch (error) {
    next(error);
  }
};

// Restreindre l'accès à certains rôles
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    // roles ['admin', 'owner']. role='user'
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('Vous n\'avez pas la permission d\'effectuer cette action', 403)
      );
    }

    next();
  };
};

// Mettre à jour le profil (sans mot de passe)
exports.updateProfile = async (req, res, next) => {
  try {
    const { firstName, lastName, phone, email } = req.body;

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new AppError('Cet email est déjà utilisé', 400);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { firstName, lastName, phone, email },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      status: 'success',
      data: { user: updatedUser },
    });
  } catch (error) {
    next(error);
  }
};

// Changer le mot de passe
exports.updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      throw new AppError('Veuillez fournir le mot de passe actuel et le nouveau', 400);
    }

    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findById(req.user.id).select('+password');

    // Vérifier le mot de passe actuel
    if (!(await user.comparePassword(currentPassword, user.password))) {
      throw new AppError('Mot de passe actuel incorrect', 401);
    }

    // Mettre à jour le mot de passe
    user.password = newPassword;
    await user.save();

    // Renvoyer un nouveau token
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// Supprimer le compte
exports.deleteAccount = async (req, res, next) => {
  try {
    const { password } = req.body;

    if (!password) {
      throw new AppError('Veuillez confirmer votre mot de passe', 400);
    }

    // Récupérer l'utilisateur avec le mot de passe
    const user = await User.findById(req.user.id).select('+password');

    // Vérifier le mot de passe
    if (!(await user.comparePassword(password, user.password))) {
      throw new AppError('Mot de passe incorrect', 401);
    }

    // Supprimer l'utilisateur
    await User.findByIdAndDelete(req.user.id);

    // Supprimer le cookie
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      status: 'success',
      message: 'Compte supprimé avec succès',
    });
  } catch (error) {
    next(error);
  }
};

// ==================== ADMIN FUNCTIONS ====================

// Récupérer tous les utilisateurs (admin)
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      data: { users }
    });
  } catch (error) {
    next(error);
  }
};

// Bannir un utilisateur (admin)
exports.banUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    res.status(200).json({
      status: 'success',
      message: 'Utilisateur banni avec succès',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// Débannir un utilisateur (admin)
exports.unbanUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: true },
      { new: true }
    ).select('-password');

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    res.status(200).json({
      status: 'success',
      message: 'Utilisateur débanni avec succès',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// Supprimer un utilisateur (admin)
exports.deleteUserByAdmin = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      throw new AppError('Utilisateur non trouvé', 404);
    }

    res.status(200).json({
      status: 'success',
      message: 'Utilisateur supprimé avec succès'
    });
  } catch (error) {
    next(error);
  }
};
