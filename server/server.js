require('dotenv').load();
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const mongoose = require('mongoose');
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

const Bot = require('./bot');
const bot = new Bot();
let Fridge;
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI, { useMongoClient: true });
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));
mongoose.connection.once('open', function () {
  console.log('connected');
  Fridge = (mongoose.connection.model('Fridge', { userId: String, ingredients: mongoose.SchemaTypes.Mixed }));
  bot.setFridge(Fridge);
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

server.post('/api/recipe', (req, res) => {
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

server.post('/api/fridge', (req, res) => {
  if (req.body.action === 'get') {
    Fridge.findOne({ userId: req.body.userId }, (err, fridge) => {
      const now = Date.now();
      const body = {
        timestamp: now,
        userId: fridge.userId,
        fridge: [],
      };
      for (let i in fridge) {
        const dayT = Math.ceil((parseInt(fridge[i].id, 10) - now) / 1000 / 86400);   // convert to day
        body.fridge.push({ id: fridge[i].id, name: fridge[i].name, day: datT, chosen: false });
      }
      res.send(JSON.stringify(body));

    });
  } else if (req.body.action === 'add') {
    if (typeof(req.body.ingredient) !== 'object') {
      return;
    }
    Fridge.findOne({ userId: req.body.userId }, (err, fridge) => {
      if(err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      let ingredients = fridge.ingredients;
      if (ingredients === undefined) {
        ingredients = {};
      }
      ingredients[Date.now().toString()] = ingredient;
      fridge.ingredients = ingredients;
      fridge.markModified('ingredients');
      fridge.save((err, result) => {
        if (err) {
          res.sendStatus(500);
          return;
        }
        console.log(result)
        res.sendStatus(200);
      });
    });
  } else if (req.body.action === 'delete') {
    Fridge.findOne({ userId: req.body.userId }, (err, fridge) => {
      if(err) {
        console.log(err);
        res.sendStatus(500);
        return;
      }
      let ingredients = fridge.ingredients;
      if (ingredients === undefined) {
        res.sendStatus(400);
        return;
      }
      if (ingredients[name].length !== 1) {
        ingredients[name].shift();
      } else {
        delete ingredients[name];
      }
      fridge.ingredients = ingredients;
      fridge.markModified('ingredients');
      fridge.save((err, result) => {
        if (err) {
          res.sendStatus(500);
          return;
        }
        console.log(result);
        res.sendStatus(200);
      });
    });
  }
});

server.post('/api/message', (req, res) => {
  const say = req.body.say.replace(/\s+/g, '');
  if (say === '') {
    bot.say(res, 'Fuck!');
    return;
  }
  request
    .get(process.env.LUIS_ENDPOINT + encodeURI(req.body.say))
    .on('data', (response) => {
      const jsonObj = JSON.parse(response.toString());
      if (jsonObj.topScoringIntent === undefined) {
        return;
      }
      const intent = jsonObj.topScoringIntent.intent;
      const responseObj = {};
      if (intent === 'Greetings') {
        bot.say(res, 'Hello! What can I do for you?');
      } else if (intent === 'FindRecipe') {
        if (jsonObj.entities.length === 0) {
          bot.say(res, 'Hmm... I don\'t quite understand what you want to find.');    
        } else {
          bot.queryTitle(jsonObj.entities[0].entity, knex, res);
        }
      } else if (intent === 'AddIngredient') {
        if (jsonObj.entities.length === 0) {
          bot.say(res, 'Hmm... I don\'t quite understand what you want to add.');  
        } else {
          bot.addIngredient('ric', {name: jsonObj.entities[0].entity, count: 2, exp: 8}, res);
        }
      } else if (intent === 'DeleteIngredient') {
        bot.deleteIngredient('ric', '1498653881103', res);
      }
    });
});

server.get('*', function (req, res) {
  res.sendfile('./public/index.html');
});


server.listen(port, () => {
  console.log('%s listening on %s', server.name, port);
});


/*

{
  say: text,
  timestamp: timestamp,
  action: intent -> none,
  entities: 
}


*/