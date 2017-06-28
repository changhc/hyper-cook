var express = require('express');
var router = express.Router();

router.get('/:user', function (req, res) {
  console.log('direct to main page');
  console.log(req.session);
  res.render('index', { layout: 'index.html' });
});
module.exports = router;