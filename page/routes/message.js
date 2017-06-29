const express = require('express');
const request = require('request');
const router = express.Router();
const knex = require('../model/knex');
const Bot = require('../model/bot');
const bot = new Bot();

router.post('/', (req, res) => {
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
        } else if (jsonObj.entities.length === 1) {
          req.session.ingredient = jsonObj.entities[0].entity;
          bot.say(res, 'When is it due?', intent);
        } else if (jsonObj.entities.length === 2) {
          const dateObj = jsonObj.entities[0].type === 'ingredient' ? jsonObj.entities[1] : jsonObj.entities[0];
          const ingredientObj = jsonObj.entities[0].type === 'ingredient' ? jsonObj.entities[0] : jsonObj.entities[1];
          let dayDiff;
          if (dateObj.resolution.values[dateObj.resolution.values.length - 1].end !== undefined) {
            dayDiff = (new Date(dateObj.resolution.values[dateObj.resolution.values.length - 1].end) - Date.now()) / 1000 / 86400;
          } else {
            dayDiff = (new Date(dateObj.resolution.values[dateObj.resolution.values.length - 1].value) - Date.now()) / 1000 / 86400;
          }

          bot.addIngredient({ name: ingredientObj.entity, id: 123, day: Math.round(dayDiff) }, req, res);
        }
      } else if (intent === 'DeleteIngredient') {
        bot.deleteIngredient(jsonObj.entities[0].entity, req, res);
      } else if (intent === 'None') {
        if (jsonObj.entities.length === 1 && req.session.ingredient) {
          const dateObj = jsonObj.entities[0];
          let dayDiff;
          if (dateObj.resolution.values[dateObj.resolution.values.length - 1].end !== undefined) {
            dayDiff = (new Date(dateObj.resolution.values[dateObj.resolution.values.length - 1].end) - Date.now()) / 1000 / 86400;
          } else {
            dayDiff = (new Date(dateObj.resolution.values[dateObj.resolution.values.length - 1].value) - Date.now()) / 1000 / 86400;
          }
          bot.addIngredient({ name: req.session.ingredient, id: 123, day: Math.round(dayDiff) }, req, res);
          return;
        }
        
        if (!req.session.noneState) {
          req.session.noneState = '0';
        } 
        const count = parseInt(req.session.noneState, 10);
        req.session.noneState = (count + 1).toString();
        if (count < 3) {
          bot.say(res, 'What????');
        } else if (count >= 3 && count < 5) {
          bot.say(res, 'Stop this.');
        } else if (count >= 5) {
          bot.say(res, 'Shut up bitch!');
        }
	    } else if (intent === 'AddTimer') {
        let duration;
        for (i in jsonObj.entities) {
          if (entities[i].type === 'builtin.datetimeV2.duration') {
            duration = jsonObj.entities[0].resolution.values[0].value;
          }
        }
        if (duration === undefined) {
          bot.say(res, 'OK, timer for 30 seconds.', 'AddTimer', { time: '30' });
        } else {
          bot.say(res, 'OK, a new timer.', 'AddTimer', { time: duration });
        }
      }
    });
});

module.exports = router;