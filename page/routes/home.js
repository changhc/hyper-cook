var express = require('express');
var router = express.Router();

router.get('/:user', function (req, res) {
  
  if(req.session.loggedIn){
    console.log('direct to main page');
    res.render('index', { layout: 'index.html' });
  } else {
    res.redirect('/');
  }
});
module.exports = router;