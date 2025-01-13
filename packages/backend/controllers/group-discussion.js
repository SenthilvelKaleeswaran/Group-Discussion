const { default: mongoose } = require("mongoose");
const GroupDiscussion = require("../models/group-discussion");
const Participant = require("../models/participant");
const Conversation = require("../models/conversation");
const { generateAIResponse } = require("../utils");
const { DiscussionTopicPrompt } = require("../prompts");
const SessionLog = require("../models/session-log");
const Session = require("../models/session");

// const generateAiParticipants = (n) => {
//   const aiNames = ["AI-Alpha", "AI-Beta", "AI-Gamma", "AI-Delta", "AI-Epsilon"]; // Example AI names
//   const aiParticipants = [];
//   for (let i = 0; i < n; i++) {
//     aiParticipants.push({ name: aiNames[i % aiNames.length] });
//   }
//   return aiParticipants;
// };

const createGroupDiscussion = async (req, res) => {
  const {
    aiModelsCount,
    participants = [],
    isTopicAiGenerated,
    ...rest
  } = req.body;

  try {
    // Generate AI participants

    let topic = rest?.topic || "";

    // Generate topic by AI
    if (isTopicAiGenerated) {
      topic = await generateAIResponse({ prompt: DiscussionTopicPrompt });
    }

    // Create the new group discussion
    const newGroupDiscussion = new GroupDiscussion({
      ...rest,
      topic,
      createdBy: req.user.userId,
    });

    await newGroupDiscussion.save();

    const groupDiscussionId = newGroupDiscussion?._id;
    const newSession = new Session({
      ...rest,
      groupDiscussionId,
      topic,
      createdBy: req.user.userId,
    });

    await newSession.save();
    const sessionId = newSession?._id;

    await Promise.all([
      new Participant({ _id: sessionId }).save(),
      new SessionLog({
        _id: sessionId,
        events: [
          {
            action: "Group Discussion Created",
            performedBy: req.user.userId,
          },
        ],
      }).save(),
      GroupDiscussion.findByIdAndUpdate(groupDiscussionId, {
        activeSession: [sessionId],
      }),
    ]);

    // // Update participants list by adding the creator (user who made the request)
    // const updatedParticipants = [...participants];

    // // Create participant entries in the Participant model
    // const createParticipants = await Promise.all(
    //   updatedParticipants.map(async (userId) => {
    //     const newParticipant = new Participant({
    //       userId,
    //       groupDiscussionId,
    //     });
    //     await newParticipant.save();
    //     return newParticipant._id; // Return the participant ID
    //   })
    // );

    // const createConversation = new Conversation({
    //   groupDiscussionId,
    // });

    // await createConversation.save();

    // console.log({ createConversation });
    // // Update the group discussion with the participant IDs
    // await GroupDiscussion.findByIdAndUpdate(
    //   groupDiscussionId,
    //   {
    //     conversationId: createConversation._id,
    //     participants: createParticipants,
    //   },
    //   { new: true }
    // );

    // Respond with the discussion ID
    res.status(201).json({ result: groupDiscussionId });
  } catch (error) {
    console.error({ error });
    res.status(500).json({ msg: "Server Error", error });
  }
};

const getGroupDiscussion = async (req, res) => {
  const groupDiscussionId = req.params.groupDiscussionId;

  try {
    const groupDiscussion = await GroupDiscussion.findById(groupDiscussionId)
      .populate({
        path: "participants",
        select: "_id name",
      })
      .populate({
        path: "aiParticipants",
        select: "_id name avatar gender",
      });

    if (!groupDiscussion) {
      return res.status(404).json({ msg: "Group Discussion not found" });
    }

    // Convert Mongoose document to plain JavaScript object
    const groupDiscussionObj = groupDiscussion.toObject();

    // Format participants
    const formattedParticipants =
      groupDiscussionObj.participants?.map(
        (participant) => participant?.userId
      ) || [];

    // Replace participants with the formatted version
    groupDiscussionObj.participants = formattedParticipants;

    res.json(groupDiscussionObj);
  } catch (error) {
    console.error("Error fetching group discussion:", error);
    res.status(500).json({ msg: "Server Error", error });
  }
};

module.exports = {
  createGroupDiscussion,
  getGroupDiscussion,
};
