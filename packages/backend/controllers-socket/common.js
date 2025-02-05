const User = require("../models/user");
const UserDetails = require("../models/user-details");
const AIModel = require('../models/ai-model'); 


const getUserNameOrEmail = async (id) => {
  return (await UserDetails.findById(id)?.name) || (await User.findById(id)?.email);
};

const getAIName = async (id) => {
    return (await AIModel.findById(id)?.name) ;
  };

module.exports = {
    getAIName,
    getUserNameOrEmail,
    

}
