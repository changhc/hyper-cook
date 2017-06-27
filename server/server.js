require('dotenv').load();
const express = require('express');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const pg = require('pg');
const knex = require('knex')({
  client: 'pg',
  connection: {
    host: process.env.DB_HOST,
    post: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_NAME,
  }
});

const recipePerPage = 30;

const server = express();
const port = process.env.PORT || 5000;

server.use('/', express.static('public'));
server.use(bodyParser.json());
server.use(bodyParser.urlencoded({ extended: true }));
server.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

server.post('/api/ingredient', (req, res) => {
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
      .catch(err => res.sendStatus(404))
  } else {
    knex
      .select('title', 'url', 'img')
      .from('recipe')
      .whereRaw(ingredient.join(' and '))
      .limit(recipePerPage)
      .then((result) => {
        res.send(JSON.stringify({ recipe: result, next: result.length === recipePerPage }));
      })
      .catch(err => res.sendStatus(404))
  }
});

server.post('/api/recipe', (req, res) => {
  const title = req.body.title;
  if (title === undefined) {
    res.sendStatus(400);
    return;
  }
  knex
    .select('title', 'url', 'img', 'ingredient')
    .from('recipe')
    .where('title', '=', title)
    .limit(recipePerPage)
    .then((result) => {
      res.send(JSON.stringify({ recipe: result }));
    })
    .catch(err => res.sendStatus(404))
});

server.get('*', function (req, res) {
  res.sendfile('./public/index.html');
});


server.listen(port, () => {
  console.log('%s listening on %s', server.name, port);
});