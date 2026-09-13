const express = require('express');
const router = express.Router();
const { register , login ,getMe, logout} = require('../controllers/authController')
const { registerValidation, loginValidation } = require('../validators/authValidators');
const  validate  = require('../middleware/validate')
const authenticate = require('../middleware/authenticate')
const { authLimiter } = require('../middleware/rateLimiters')

// console.log("1. registerValidation is:", typeof registerValidation);
// console.log("2. Validate is:", typeof Validate);
// console.log("3. register is:", typeof register);

router.post('/register' , registerValidation , validate , register);
router.post('/login' , loginValidation , validate , login)
router.get('/me' , authenticate , getMe);
router.post('/register', authLimiter, registerValidation, validate, register);
router.post('/login', authLimiter, loginValidation, validate, login);
router.post('/logout', authenticate, logout);

module.exports = router;