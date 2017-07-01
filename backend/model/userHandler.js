const User = require('./Schemas/user');

const add = (username, password) => new User({username, password}).save();
const findByUsername = (username) => User.findOne({ username }).exec();
const findAllUsers = () => User.find({}).select('username').exec();
const deleteUser = username => User.findOne({ username }).remove().exec();
const changePassword = (username, password) => User.update({username}, {$set: {password}}).exec();

const updateStorageByUserName = (name, newIngredient) =>
  User.findOneAndUpdate({ username: name }, { $push: { ingredients: newIngredient } }).exec();
const deleteStorageById = (username, uid) => User.update(
  { username },
  { $pull: { ingredients: { id: uid } } },
  { multi: true }
).exec();
const deleteStorageByName = (username, foodName) => User.update(
  { username },
  { $pull: { ingredients: { name: foodName } } },
  { multi: true }
).exec();
module.exports = {
  add,
  findByUsername,
  findAllUsers,
  deleteUser,
  changePassword,
  updateStorageByUserName,
  deleteStorageById,
  deleteStorageByName, 
};
