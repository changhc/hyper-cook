const express = require('express');
const router = express.Router();
const userHandler = require('../model/userHandler.js');
const co = require('co');
const bcrypt = require('bcrypt-nodejs');

router.get('/', function(req, res) {
  res.render('register', {layout: 'register.html'});
});

router.post('/', function(req, res) {
  console.log('receive sign up request');
  const username = req.body.username;
  const password = req.body.password;
  const repeatPassword = req.body.repeatPassword;

  if(password !== repeatPassword){
    console.log('wrong repeat password');
    return res.redirect('/register');
  }
  co(function*(){
    const user = yield userHandler.findByUsername(username);
    if(user){
      console.log('user already exist');
      return res.redirect('/register');
    }
    bcrypt.hash(password, null, null, (err, hash) => {
      if(err){
        console.log('Error', err);
        return res.redirect('/');
      }
      userHandler.add(username, hash)
      .then(data => console.log(data))
      .then(() => res.redirect('/'))
      .catch(err => console.log(err));          
    });
  })
  .catch(() => res.redirect('/register'));
});

module.exports = router;
