// app.js
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcrypt');
const User = require('./models/User');

const app = express();

// MongoDB Connection
mongoose.connect('mongodb+srv://adhikaribibek84:aHAqnN3rMGJXn3zS@cluster0.cjr7qt8.mongodb.net/auth-app?retryWrites=true&w=majority')
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: true
}));

// Routes
app.get('/', (req, res) => res.send('/login'));

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  const existingUser = await User.findOne({ username });
  if (existingUser) return res.send('User already exists');

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();
  // Pass a success message to login page
  res.render('login', { message: 'Registration successful! Please log in.' });
});

app.get('/login', (req, res) => {
  res.render('login', { message: null });
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username });

  if (!user) return res.send('Invalid username');
  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.send('Invalid password');

  req.session.user = user;
  res.redirect('/dashboard');
});

app.get('/dashboard', (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  res.render('dashboard', { username: req.session.user.username });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.listen(3000, () => {
  console.log('Server started on http://localhost:3000');
});
