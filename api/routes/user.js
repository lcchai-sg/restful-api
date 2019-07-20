const express = require('express');
const router = express.Router();
const checkAuth = require('../auth/check-auth');
const UserController = require('../controllers/users');

router.post('/signup', UserController.users_sign_up);

router.post('/login', UserController.users_login);

// todo: require role settings to allow delete, otherwise any users with valid token can delete other users
router.delete('/:userId', checkAuth, UserController.users_delete);

module.exports = router;