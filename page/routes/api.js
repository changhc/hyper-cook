const express = require('express');
const router = express.Router();
const userHandler = require('../model/userHandler.js');

function pullStorage(req, res) {
  const username = req.session.loggedIn;
  if(username !== undefined) {
    console.log(`${username}: load food storage data`);
    userHandler.findByUsername(username)
    .then(data => {
      console.log(data);
      return res.send(data);
    })
    .catch(() => console.log(`${username}: did not find user`));
  } else {
    res.redirect('/');
  }
}
router.get('/foodStorage', pullStorage);

router.put('/foodStorage', function(req, res) { 
  const username = req.session.loggedIn;
  if(username !== undefined) {
    console.log(`${username}:update food storage`);
    if(req.body.delete === false) {
      userHandler.updateStorageByUserName(username, req.body)
      .then(() => console.log("successfully put food into the freeze"))
      .then(() => pullStorage(req, res))
      .catch(err => console.log(err));
    } else {
      userHandler.deleteStorageById(username, req.body.id)
      .then(() => console.log("remove food from the freeze"))
      .then(() => pullStorage(req, res))
      .catch(err => console.log(err));
    }
  } else {
    res.redirect('/');
  }
});



module.exports = router;