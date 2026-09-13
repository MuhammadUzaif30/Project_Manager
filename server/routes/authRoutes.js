const express = require('express');
const router = express.Router();
const { register , login ,getMe} = require('../controllers/authController')
const { registerValidation, loginValidation } = require('../validators/authValidators');
const  validate  = require('../middleware/validate')
const authenticate = require('../middleware/authenticate')

// console.log("1. registerValidation is:", typeof registerValidation);
// console.log("2. Validate is:", typeof Validate);
// console.log("3. register is:", typeof register);

router.post('/register' , registerValidation , validate , register);
router.post('/login' , loginValidation , validate , login)
router.get('/me' , authenticate , getMe);

module.exports = router;