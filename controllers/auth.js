const authRouter = require('express').Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

authRouter.post('/register', async (req, res) => {
    try {
      const isExisting = await User.findOne({ email: req.body.email });
      if (isExisting) {
        throw new Error('An account with this email already exists. Please try with a different email.');
      }
  
      if (!req.body.password) {
        return res.status(400).json({ error: 'Password is required.' });
      }
  
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
  
      const newUser = await User.create({ ...req.body, password: hashedPassword });
  
      const { password, ...others } = newUser._doc;
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: '2d' });
  
      return res.status(201).json({ user: others, token });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })

authRouter.post('/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!req.body.password) {
      throw new Error('Password is required.');
    }

    const comparePass = await bcrypt.compare(req.body.password, user.password);
    if (!comparePass) {
      throw new Error('Invalid credentials');
    }

    const { password, ...others } = user._doc;
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '2d' });

    return res.status(200).json({ user: others, token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = authRouter;
