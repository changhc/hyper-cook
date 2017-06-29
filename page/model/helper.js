'use strict';
// initalize db
var mongoose = require('mongoose');

var initialize = () => {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/user_data');
  var db = mongoose.connection;

  db.on('error', function (err) {
    console.log(err);
    console.log('db error');
  });

  db.once('open', function () {
    console.log('db open');
  });

  process.on('SIGINT', function () {
    db.close(function () {
      console.log(' Mongoose connection disconnected app termination.');
      process.exit(0);
    });
  });


};

module.exports = initialize();
