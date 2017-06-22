const fs = require('fs');
const request = require('request');

if (process.argv.length < 4) {
  throw new Error('Too few arguments!');
}

const API_KEY = process.argv[2];
const startId = parseInt(process.argv[3], 10);
const count = 400;
const baseUrl = `http://food2fork.com/api/get?key=${API_KEY}&rId=`;

let promiseList = [];
for (let i = 0; i < count; i += 1) {
  const req = new Promise((resolve, reject) => {
    const req = request({
        url: baseUrl + (startId + i).toString(),
        json: true,
        timeout: 120000,
      }, (err, res, body) => {
        if (err || res.statusCode < 200 || res.statusCode > 299) {
          reject(err);
        }
        resolve(body);
      }
    );
  });
  promiseList.push(req);

}

Promise.all(promiseList).then(values => {
  const writer = fs.createWriteStream(`${startId}-${startId + count - 1}.txt`);
  writer.on('error', (err) => console.error(err));
  values.forEach((value) => { writer.write(JSON.stringify(value) + '\n'); });
  writer.end();
})
.catch(err => console.error(err));
