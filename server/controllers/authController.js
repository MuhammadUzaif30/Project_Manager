const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'An account with email already exists' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
        });
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });
        
        res.status(201).json({
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });
        
    } catch (err) {
        console.log(err); 
        res.status(500).json({ message: 'Something went wrong' });
    }
};
const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
           
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d',
        });
        
        res.status(200).json({
            token,
            user: { id: user._id, name: user.name, email: user.email },
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: 'Something went wrong' });
    }
};
const getMe = async (req, res) => {
    res.status(200).json({
        user: { id: req.user._id, name: req.user.name, email: req.user.email },
    });
};


module.exports = { register , login , getMe};