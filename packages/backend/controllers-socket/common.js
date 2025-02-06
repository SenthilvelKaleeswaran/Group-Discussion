const User = require("../models/user");
const UserDetails = require("../models/user-details");
const AIModel = require("../models/ai-model");

const getUserNameOrEmail = async (id) => {
  const name = await UserDetails.findById(id);
  const email = await User.findById(id);
  return { name : name?.name, email : email?.email };
};

const getAIName = async (id) => {
  return await AIModel.findById(id)?.name;
};

module.exports = {
  getAIName,
  getUserNameOrEmail,
};
