const getUserRole = (participant, userId) => {
    if (participant.admin.has(userId)) {
      return "admin";
    } else if (participant.listener.has(userId)) {
      return "listener";
    } else if (participant.participants.has(userId)) {
      return "participants";
    } else {
      return "";
    }
  };

const getRoleData = (participant, userId)=>{
  const role = getUserRole(participant, userId)
  if(role === 'admin'){
    return {role , participant}
  }else if(role === 'listener'){
    return {role , participant}
  }else {
    return {role , participant}
  }
}

module.exports ={ 
    getUserRole,
    getRoleData
}
  