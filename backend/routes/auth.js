const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
require('dotenv').config();

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  let user = await User.findOne({ username });
  if (user) return res.status(400).send('User already exists.');

  user = new User({ username, password });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(password, salt);
  await user.save();

  res.status(200).send('User registered successfully');
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });
  if (!user) return res.status(400).send('Invalid username or password.');

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return res.status(400).send('Invalid username or password.');

  const token = jwt.sign({ _id: user._id, username: user.username }, process.env.JWT_PRIVATE_KEY);
  res.status(200).send(token);
});

module.exports = router;
