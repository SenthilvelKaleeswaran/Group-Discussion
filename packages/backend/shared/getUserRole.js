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

const getRoleData = (participant, userId, type) => {
  console.log({participant})
  const {
    listener={},
    moderator={},
    admin={},
    participant: participantList={},
  } = participant;

  let list = [
    ...Array.from((listener)?.values()),
    ...Array.from((moderator)?.values()),
    ...Array.from((admin)?.values()),
    ...Array.from((participantList)?.values()),
  ];

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
  getUserRole,
  getRoleData,
};
