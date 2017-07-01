const mongoose = require('mongoose');

let Schema = mongoose.Schema;
let userSchema = new Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  favorite: [{type: String}],
  ingredients: [
    {
      id: {type: String},
      name: { type: String },
//      foodType: { type: String },
      day:  { type: Number },
//      amount:{
//          quantity: {type: Number},
//          unit: {type: String},
//      }
    },
  ],

});

let Model = mongoose.model('user', userSchema);
module.exports = Model;
