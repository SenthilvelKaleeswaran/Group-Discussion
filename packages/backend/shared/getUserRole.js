const getUserRole = (participant, userId) => {
  if (participant?.admin?.has(userId)) {
    return "admin";
  } else if (participant?.moderator?.has(userId)) {
    return "moderator";
  } else if (participant?.listener?.has(userId)) {
    return "listener";
  } else if (participant?.participant?.has(userId)) {
    return "participant";
  } else {
    return "";
  }
};

const getUserData = (participant, userId) => {
  const type = getUserRole(participant, userId);
  if (type) {
    return { role: type, user: participant[type].get(userId) };
  }
};

const getRoleData = (participant, userId, type) => {
  const {
    listener = {},
    moderator = {},
    admin = {},
    participant: participantList = {},
  } = participant;

  let list = {
    listener: Array.from(listener?.values()),
    moderator: Array.from(moderator?.values()),
    admin: Array.from(admin?.values()),
    participant: Array.from(participantList?.values()),
  };

  if (type === "admin") {
  } else if (type === "listener") {
  } else {
  }

  return {
    role: type,
    participant: list,
  };
};

module.exports = {
  getUserData,
  getUserRole,
  getRoleData,
};
