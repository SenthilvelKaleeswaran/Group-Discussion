const GroupDiscussion = require('../models/GroupDiscussion');

const generateAiParticipants = (n) => {
  const aiNames = ['AI-Alpha', 'AI-Beta', 'AI-Gamma', 'AI-Delta', 'AI-Epsilon']; // Example AI names
  const aiParticipants = [];
  for (let i = 0; i < n; i++) {
    aiParticipants.push({ name: aiNames[i % aiNames.length] });
  }
  return aiParticipants;
};

const createGroupDiscussion = async (req, res) => {
  const { topic, noOfAiModels, noOfUsers, aiParticipants, participants, createdBy } = req.body;

  try {
    const generatedAiParticipants = generateAiParticipants(noOfAiModels);
    const allAiParticipants = [...aiParticipants, ...generatedAiParticipants];

    const newGroupDiscussion = new GroupDiscussion({
      topic,
      noOfAiModels,
      noOfUsers,
      aiParticipants: allAiParticipants,
      participants,
      createdBy,
    });

    await newGroupDiscussion.save();

    participants.forEach(async (userId) => {
      const newParticipant = new Participant({
        userId,
        groupDiscussionId: newGroupDiscussion._id,
      });
      await newParticipant.save();
    });

    res.status(201).json(newGroupDiscussion);
  } catch (error) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

const getGroupDiscussion = async (req, res) => {
  const groupDiscussionId = req.params.groupDiscussionId;

  try {
    const groupDiscussion = await GroupDiscussion.findById(groupDiscussionId)
      .populate('participants')
      .populate('conversationId');

    if (!groupDiscussion) {
      return res.status(404).json({ msg: 'Group Discussion not found' });
    }

    res.json(groupDiscussion);
  } catch (error) {
    res.status(500).json({ msg: 'Server Error' });
  }
};

module.exports =  {
    createGroupDiscussion,
    getGroupDiscussion
}
