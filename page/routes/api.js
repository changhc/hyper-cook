const express = require('express');
const router = express.Router();
const userHandler = require('../model/userHandler.js');
const knex = require('../model/knex');

const recipePerPage = 30;

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
  console.log(req.headers)
  const username = req.session.loggedIn;
  if(username !== undefined) {
    console.log(`${username}:update food storage`);
    if(req.body.delete === false) {
      userHandler.updateStorageByUserName(username, req.body)
      .then(() => console.log("successfully put food into the freeze"))
      .then(() => pullStorage(req, res))
      .catch(err => console.log(err));
    } else {
      if(req.body.fromBot) {
        userHandler.deleteStorageByName(username, req.body.name)
        .then(()=>console.log('remove food from the freeze'))
        .then(() => pullStorage(req, res))
        .catch(err => console.log(err));
      } else {
        userHandler.deleteStorageById(username, req.body.id)
        .then(() => console.log("remove food from the freeze"))
        .then(() => pullStorage(req, res))
        .catch(err => console.log(err));
      }
    }
  } else {
    res.redirect('/');
  }
});

router.post('/recipe', (req, res) => {
  let title = req.body.title;
  if (title === undefined) {
    res.sendStatus(400);
    return;
  }
  const tokens = title.split(' ');
  for (i in tokens) {
    tokens[i] = tokens[i][0].toUpperCase() + tokens[i].substr(1, tokens[i].length);
  }
  title = tokens.join(' ');

  knex
    .select('title', 'url', 'img')
    .from('recipe')
    .where('title', 'like', `%${title}%`)
    .limit(recipePerPage)
    .then((result) => {
      res.send(JSON.stringify({ recipe: result }));
    })
    .catch(err => res.sendStatus(404));
});

router.post('/ingredient', (req, res) => {
  const ingredient = req.body.ingredient;
  if (!Array.isArray(ingredient) || ingredient === undefined) {
    res.sendStatus(400);
    return;
  }

  if (req.body.vague) {
    const commandArray = [];
    for (index in ingredient) {
      commandArray.push(`(case when ${ingredient[index]} then 1 else 0 end)`);
    }
    knex
      .select('title', 'url', 'img')
      .from('recipe')
      .orderByRaw(`(${commandArray.join(' + ')}) DESC`)
      .limit(recipePerPage)
      .then((result) => {
        res.send(JSON.stringify({ recipe: result, next: result.length === recipePerPage }));
      })
      .catch(err => res.sendStatus(404));
  } else {
    knex
      .select('title', 'url', 'img')
      .from('recipe')
      .whereRaw(ingredient.join(' and '))
      .limit(recipePerPage)
      .then((result) => {
        res.send(JSON.stringify({ recipe: result, next: result.length === recipePerPage }));
      })
      .catch(err => res.sendStatus(404));
  }
});

router.use('/message', require('./message'));



module.exports = router;