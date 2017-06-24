const readline = require('readline');
const pos = require('pos');
const fs = require('fs');

if (process.argv.length !== 3) {
  throw new Error('Should have only one argument!');
}

const inputStream = fs.createReadStream(process.argv[2]);

const filter = ['/', 'cup', 'ounce', 'package', '&nbsp', 'tablespoon', 'teaspoon', 'degree', 'container', 'can', 'pound'];
const parsed = [];
let eof = false;

const rl = readline.createInterface({
  input: inputStream,
});

rl.on('close', () => {
  fs.writeFile(process.argv[2] + '.out', parsed.join('\n'), (err) => {
    if (err) throw err;
    console.log('Done.');
  });
});

rl.on('line', (input) => {
  const ingredients = JSON.parse(input).recipe.ingredients;
  if (ingredients === undefined) return;
  const ingredient = [];
  for (let i = 0; i < ingredients.length; i+= 1) {
    const cleanedWords = [];
    ingredients[i].replace(/\(.*\)/g, '');
    const index = ingredients[i].indexOf(',');
    if (index !== -1) {
      ingredients[i] = ingredients[i].substr(0, index);
    }

    var words = new pos.Lexer().lex(ingredients[i]);
    var tagger = new pos.Tagger();
    var taggedWords = tagger.tag(words);
    for (let j in taggedWords) {
      var taggedWord = taggedWords[j];
      var word = taggedWord[0];
      var tag = taggedWord[1];
      if (tag === 'NNS') {
        word = word.substr(0, word.length - 1);
        tag = 'NN';
      }
      word = word.replace(/[&\*]/g, '');
      if (tag !== 'NN' || filter.indexOf(word) !== -1 || word.length === 1) {
        continue;
      }
      cleanedWords.push(word.toLowerCase());
    }
    const concatWords = cleanedWords.join(' ');
    if (cleanedWords.length === 0 || ingredient.indexOf(concatWords) !== -1) continue;
    ingredient.push(concatWords);
  }
  parsed.push(ingredient.join(','));
});
