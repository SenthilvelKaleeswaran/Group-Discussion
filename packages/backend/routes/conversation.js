const express = require("express");
const {
  getConversation,
  createConversation,
  updateConversation,
  deleteConversation,
} = require("../controllers/conversation");

const router = express.Router();

router.get("/:id", getConversation);
router.post("/:id", createConversation);
router.patch("/:id", updateConversation);
router.delete("/:id", deleteConversation);

module.exports = router;
