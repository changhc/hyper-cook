const readline = require('readline');
const pos = require('pos');
const fs = require('fs');

if (process.argv.length !== 3) {
  throw new Error('Should have only one argument!');
}

const inputStream = fs.createReadStream(process.argv[2]);

const filter = ['/', 'cup', 'ounce', 'package', 'nbsp', 'tablespoon', 'teaspoon', 'degree', 'container', 'bunch', 'jar', 'fluid', 'can', 'pound', 'inch', 'ingredient', 'recipe'];
const parsed = [];
const dictionay = {};
let eof = false;

const createScript = () => {
  let script = 'CREATE TABLE recipe (\n\ttitle\tVARCHAR(100) NOT NULL,\n\turl\tVARCHAR(200) NOT NULL,\n\timg\tTEXT,\n\tingredient\tTEXT NOT NULL,\n';
  for (key in dictionay) {
    if (key === '') console.log(1);
    script += `\t${key}\tBOOLEAN,\n`;
  }
  script = script.substr(0, script.length - 2);
  script += '\n);\n';
  for (index in parsed) {
    const recipe = parsed[index];
    const title = recipe.title.replace(/'/g, '\'\'');
    script += `INSERT INTO recipe (title, url, img, ingredient, ${recipe.ingredient.join(',')}) VALUES ('${title}', '${recipe.url}', '${recipe.img}', '${recipe.ingredient.join(',')}', ${Array(recipe.ingredient.length).fill('TRUE').join(',')});\n`;
  }
  return script;
}

const rl = readline.createInterface({
  input: inputStream,
});

rl.on('close', () => {
  fs.writeFile(process.argv[2] + '.out', JSON.stringify(parsed), (err) => {
    if (err) throw err;
    console.log('Done.');
  });
  fs.writeFile('data/script', createScript(), (err) => {
    if (err) throw err;
    console.log('script created.');
  });
});

rl.on('line', (input) => {
  const raw = JSON.parse(input).recipe;
  if (raw === undefined) return;
  const ingredients = JSON.parse(input).recipe.ingredients;
  if (ingredients === undefined) return;
  const recipe = {};
  recipe.title = raw.title;
  recipe.url = raw.f2f_url;
  recipe.img = raw.image_url;
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
        if (word.substr(word.length - 3, word.length) === 'oes') {
          word = word.substr(0, word.length - 2);
        } else {
          word = word.substr(0, word.length - 1);
        }
        tag = 'NN';
      }
      word = word.toLowerCase();
      word = word.replace(/[&\*%]/g, '');
      word = word.replace(/-/g, '_');
      if (tag !== 'NN' || filter.indexOf(word) !== -1 || word.length === 1) {
        continue;
      }
      cleanedWords.push(word);
    }
    const concatWords = cleanedWords.join('_');
    if (concatWords.length === 0 || ingredient.indexOf(concatWords) !== -1) continue;
    ingredient.push(concatWords);
    dictionay[concatWords] = 1;
  }
  recipe.ingredient = ingredient;
  parsed.push(recipe);
});
