const Participant = require("../models/participant");

const getParticipants = async (req, res) => {
  console.log({req,res})
  const { sessionId } = req.params;

  try {
    const participants = await Participant.findOne({ sessionId })
    console.log({participantsparticipants : participants})
    res.json(participants);
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};

const createParticipant = async (req, res) => {
  const { userId, groupDiscussionId } = req.body;

  try {
    const newParticipant = new Participant({
      userId,
      groupDiscussionId,
    });

    await newParticipant.save();
    res.status(201).json(newParticipant);
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};

const updateParticipant = async ({
  groupDiscussionId,
  userId,
  role,
  details,
}) => {
  const participantType =
    role === "admin"
      ? "admin"
      : role === "listener"
      ? "listeners"
      : "participants";
  await Participant.findOneAndUpdate(
    { groupDiscussionId },
    {
      $set: {
        [`${participantType}.${userId}`]: details,
      },
    },
    { upsert: true, new: true }
  );
};

const deleteParticipant = async ({ groupDiscussionId, userId, role }) => {
  const participantType =
    role === "admin"
      ? "admin"
      : role === "listener"
      ? "listeners"
      : "participants";
  await Participant.findOneAndUpdate(
    { groupDiscussionId },
    { $unset: { [`${participantType}.${userId}`]: 1 } },
    { new: true }
  );
};



module.exports = {
  createParticipant,
  getParticipants,
  updateParticipant,
  deleteParticipant
};
