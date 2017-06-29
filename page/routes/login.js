var express = require('express');
var router = express.Router();
var userHandler = require('../model/userHandler');
var bcrypt = require('bcrypt-nodejs');


router.get('/', function(req, res){
  if(req.session.loggedIn){
    res.redirect(`/home/${req.session.loggedIn}`);
  }
  res.render('login', { layout: 'login.html' });

});


router.post('/', function(req, res){
  if(req.session.loggedIn){
    res.redirect(`/home/${req.session.loggedIn}`);
  }else{
    userHandler.findByUsername(req.body.username).then(function(user){
      if (user == null){
        console.log('Failed to login! No User');
        res.redirect('/');
      }else{
        var formUsername = req.body.username;
        var formPassword = req.body.password;
        var dbUsername = user.username;
        var dbPasswordHash = user.password;
        bcrypt.compare(formPassword, dbPasswordHash, function(err, isPasswordCorrect){
          if(err){
            console.log('Error', err);
            return res.redirect('/');
          }

        if(formUsername == dbUsername && isPasswordCorrect){
            req.session.loggedIn = dbUsername;
            console.log(`user ${dbUsername} successfully log in`);
            res.redirect(`/home/${dbUsername}`);
          }else{
            console.log('Wrong username or password!');
            res.redirect('/');
          }
        });

      }

    }, function(err){
      console.log(err);
      res.redirect('/');
    });
  }
});


router.get('/logout', function(req, res){

  req.session.destroy(function (err){
    if(err){
      console.log(err);
    }else{
      console.log('User successfully logged out');
      res.redirect('/login');
    }
  });
});



module.exports = router;
