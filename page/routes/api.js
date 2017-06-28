const express = require('express');
const router = express.Router();
const userHandler = require('../model/userHandler.js');

function pullStorage(req, res) {
  const username = req.session.loggedIn;
  //debug for session
  console.log('load food storage data');
  console.log( req.session.id);
  console.log(req.session.loggedIn);
  userHandler.findByUsername(username)
  .then(data => {
    console.log(data);
    return res.send(data);
  })
  .catch(() => console.log(`didnotfind ${username}`));
}
router.get('/foodStorage', pullStorage);

router.put('/foodStorage', function(req, res) { 
  const username = req.session.loggedIn;
  console.log(`${username} update food storage`);
  if(req.body.delete === false) {
    userHandler.updateStorageByUserName(username, req.body)
    .then(() => console.log("successfully put food into the freeze"))
    .then(() => pullStorage(req, res))
    .catch(err => console.log(err));
  } else {
    userHandler.deleteStorageByUserName(username, req.body.name)
    .then(() => console.log("remove food from the freeze"))
    .then(() => pullStorage(req, res))
    .catch(err => console.log(err));
  }
  
});



module.exports = router;