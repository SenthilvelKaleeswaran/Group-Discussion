const express = require("express");
const router = express.Router();
const { updateUserDetails, getUserDetails } = require("../controllers/user");

router.post("/update", updateUserDetails);
router.get("/get", getUserDetails);

module.exports = router;
