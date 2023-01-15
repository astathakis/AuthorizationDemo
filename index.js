const express = require('express');

const app = express();

const User = require('./models/user');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');

mongoose.set('strictQuery', true);

mongoose
  .connect('mongodb://localhost:27017/authDemo')
  .then(() => {
    console.log('connection opened!!!');
  })
  .catch((err) => {
    console.log('connection refused', err);
  });

app.set('view engine', 'ejs');
app.set('views', 'views');
app.use(express.urlencoded({ extended: true }));
app.use(
  session({ secret: 'notagoodsecret', resave: false, saveUninitialized: true })
);

/*middleware to verify if someone is logged in 
cause most of the times we want to protect multiple routes/end points/entire router eg. /admin*/

const requireLogin = (req, res, next) => {
  if (!req.session.user_id) {
    return res.redirect('/login');
  }
  next();
};

//routes
app.get('/', (req, res) => {
  res.send('this is the home page');
});

app.get('/register', (req, res) => {
  res.render('register');
});

app.post('/register', async (req, res) => {
  // res.send(req.body);
  const { password, username } = req.body;
  // const hash = await bcrypt.hash(password, 12);
  const user = new User({
    username,
    password,
  });
  await user.save();
  req.session.user_id = user._id;

  // res.send(hash);
  res.redirect('/');
});

app.get('/login', (req, res) => {
  res.render('login');
});
app.post('/login', async (req, res) => {
  // res.send(req.body);
  const { username, password } = req.body;
  const foundUser = await User.findAndValidate(username, password);
  // const user = await User.findOne({ username });
  // //never give hint of what exactly went wrong
  // const validPassword = await bcrypt.compare(password, user.password);
  if (foundUser) {
    req.session.user_id = foundUser._id;
    // res.send('Welcome');
    res.redirect('/secret');
  } else {
    res.redirect('/login');
  }
});

app.post('/logout', (req, res) => {
  req.session.user_id = null;
  // req.session.destroy()
  res.redirect('/login');
});

app.get('/secret', requireLogin, (req, res) => {
  res.render('secret');
  // res.send('this is secret!!unless you are logged in');
});

app.get('/topsecret', requireLogin, (req, res) => {
  // res.render('secret');
  res.send('topsecret');
  // res.send('this is secret!!unless you are logged in');
});

app.listen(3000, () => {
  console.log('server listening on port 3000..');
});
