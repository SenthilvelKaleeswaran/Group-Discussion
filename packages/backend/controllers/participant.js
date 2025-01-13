const Participant = require('../models/participant');

const getParticipants = async (req, res) => {
  const {groupDiscussionId} = req.params;

  try {
    const participants = await Participant.find({ groupDiscussionId }).populate('userId name');
    res.json(participants);
  } catch (error) {
    res.status(500).json({ msg: 'Server Error' });
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
    res.status(500).json({ msg: 'Server Error' });
  }
};


module.exports = {
    createParticipant,
    getParticipants
}