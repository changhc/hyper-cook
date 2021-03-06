const request = require('request');

module.exports = class Bot {
  setFridge(Fridge) {
    this.Fridge = Fridge;
  }

  say(res, text, actionArg='None', entitiesArg={}) {
    res.send(JSON.stringify({ timestamp: Date.now(), action: actionArg, entities: entitiesArg, say: text }));
  }

	deleteIngredient(nameArg, username, res) {
    request({ 
      uri: `http://localhost:${process.env.PORT || 3000}/api/foodStorage`,
      method: 'PUT',
      json: {
        userId: username,
        delete: true,
        fromBot: true,
        name: nameArg,
      },
      }, (err, response, body) => {
      if (err) {
        console.log(err);
        this.say(res, 'Sorry. Something went wrong.');
        return;
      }
      this.say(res, `I\'ve removed ${nameArg} from you fridge!`, 'DeleteIngredient', body);
    });
    /*
    this.Fridge.findOne({ userId: userIdArg }, (err, fridge) => {
      if(err) {
        console.log(err);
        this.say(res, 'Sorry. Something went wrong.');
        return;
      }
      let ingredients = fridge.ingredients;
      if (ingredients === undefined) {
        this.say(res, 'Your fridge is empty! Damn!', 'DeleteIngredient');
        return;
      }
      if (ingredients[name] === undefined) {
        this.say(res, 'Your don\'t have this in your fridge! Damn!', 'DeleteIngredient');
        return;
      } else if (ingredients[name].length !== 1) {
        ingredients[name].shift();
      } else {
        delete ingredients[name];
      }
      fridge.ingredients = ingredients;
      fridge.markModified('ingredients');
      fridge.save((err, result) => {
        if (err) {
          this.say(res, 'Sorry. Something went wrong.');
          return;
        }
        this.say(res, `I\'ve removed ${name} from you fridge!`, 'Success');
      });
    });
    */
	}

	addIngredient(ingredient, username, res)  {
    request({
      uri: `http://localhost:${process.env.PORT || 3000}/api/foodStorage`,
      method: 'PUT',
      json: {
        delete: false,
        userId: username,
        name: ingredient.name,
        id: ingredient.id,
        day: ingredient.day,
      },
      }, (err, response, body) => {
      if (err) {
        console.log(err);
        this.say(res, 'Sorry. Something went wrong.');
        return;
      }
      this.say(res, `I\'ve added ${ingredient.name} to you fridge!`, 'AddIngredient', body);
    });
    /*
    if (typeof(ingredient) !== 'object') {
      res.sendStatus(400);
      return;
    }
    this.Fridge.findOne({ userId: userIdArg }, (err, fridge) => {
      if(err) {
        console.log(err);
        this.say(res, 'Sorry. Something went wrong.');
        return;
      }
      let ingredients = fridge.ingredients;
      if (ingredients === undefined) {
        ingredients = {};
      }
      if (ingredients[ingredient.name] === undefined) {
        ingredients[ingredient.name] = [];
      }
      ingredients[ingredient.name].push({ addTime: Date.now(), count: ingredient.count, exp: ingredient.exp });
      fridge.ingredients = ingredients;
      fridge.markModified('ingredients');
      fridge.save((err, result) => {
        if (err) {
          this.say(res, 'Sorry. Something went wrong.');
          return;
        }
        this.say(res, `I\'ve added ${ingredient.name} to you fridge!`, 'Success', ingredient);
      });
    });
    */
	}

	queryTitle(title, knex, res) {
    const tokens = title.split(' ');
    for (let i in tokens) {
      tokens[i] = tokens[i][0].toUpperCase() + tokens[i].substr(1, tokens[i].length);
    }
    const foodName = tokens.join(' ');
    knex
      .select('title', 'url')
      .from('recipe')
      .where('title', 'like', `%${foodName}%`)
      .limit(3)
      .then((result) => {
        if (result.length !== 0) {
          this.say(res, 'I\'ve found something for you!', 'FindRecipe', { food: title });
        } else {
          this.say(res, `Sorry. I didn\'t find anything about ${title} :(`, 'FindRecipe', { food: title });
        }
      })
      .catch((err) => { console.log(err); res.status(500).send(err); });
    /*
    this.Fridge.update(
      { userId: 'test'}, 
      { $set : { ingredients: { egg: { id: 888, count: 1, exp: 0 }} } }, 
      {multi: true}, 
      (err, result) => {  
        if (err) {
          res.sendStatus(400);
          return;
        }
        console.log(result);
        res.sendStatus(200);
      }
    );
    */
    /*
    this.Fridge.find({ userId: 'test' }, (err, result) => {
      if (err) {
          res.sendStatus(400);
          return;
        }
        console.log(result);
        res.sendStatus(200);
    })
    */
	}
};