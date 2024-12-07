const GroupDiscussion = require("../models/group-discussion");
const Participant = require("../models/participant");

const generateAiParticipants = (n) => {
  const aiNames = ["AI-Alpha", "AI-Beta", "AI-Gamma", "AI-Delta", "AI-Epsilon"]; // Example AI names
  const aiParticipants = [];
  for (let i = 0; i < n; i++) {
    aiParticipants.push({ name: aiNames[i % aiNames.length] });
  }
  return aiParticipants;
};

const createGroupDiscussion = async (req, res) => {
  const { aiModelsCount, participants = [], ...rest } = req.body;

  try {
    // Generate AI participants
    const aiParticipants = generateAiParticipants(aiModelsCount);

    // Create the new group discussion
    const newGroupDiscussion = new GroupDiscussion({
      ...rest,
      aiModelsCount,
      aiParticipants,
      createdBy: req.user.userId,
    });

    await newGroupDiscussion.save();

    const discussionId = newGroupDiscussion?._id;

    // Update participants list by adding the creator (user who made the request)
    const updatedParticipants = [...participants, req.user.userId];

    // Create participant entries in the Participant model
    const createParticipants = await Promise.all(updatedParticipants.map(async (userId) => {
      const newParticipant = new Participant({
        userId,
        groupDiscussionId: discussionId,
      });
      await newParticipant.save();
      return newParticipant._id;  // Return the participant ID
    }));

    // Update the group discussion with the participant IDs
   await GroupDiscussion.findByIdAndUpdate(
      discussionId,
      { participants: createParticipants },
      { new: true }  // Return the updated document
    );

    // Respond with the discussion ID
    res.status(201).json({result : discussionId});
  } catch (error) {
    res.status(500).json({ msg: "Server Error", error });
  }
};


const getGroupDiscussion = async (req, res) => {
  const groupDiscussionId = req.params.groupDiscussionId;

  try {
    const groupDiscussion = await GroupDiscussion.findById(groupDiscussionId)
      .populate("participants")
      .populate("conversationId");

    if (!groupDiscussion) {
      return res.status(404).json({ msg: "Group Discussion not found" });
    }

    res.json(groupDiscussion);
  } catch (error) {
    res.status(500).json({ msg: "Server Error" });
  }
};

module.exports = {
  createGroupDiscussion,
  getGroupDiscussion,
};
