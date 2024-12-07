const UserDetails = require("../models/user-details"); // Adjust path as needed

const getUserDetails = async (req, res) => {
  const { userId } = req.user;
  console.log({ userId });

  if (!userId) return res.status(400).json({ msg: "Invalid Credentials" });

  try {
    const user = await UserDetails.findById(userId);
    res.json(user);
  } catch (error) {
    console.error("Error : ", error);
    res.status(500).json({ msg: "Server error." });
  }
};

const updateUserDetails = async (req, res) => {
  const { userId } = req.user;
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ msg: "Name is required." });
  }

  try {
    const user = await UserDetails.findOneAndUpdate(
      { _id: userId }, // Match the user by ID
      { name }, // Update the name field
      {
        new: true, // Return the updated document
        upsert: true, // Create a new document if one doesn't exist
        runValidators: true, // Run validation on the input data
      }
    );

    res.json(user); // Send back the updated or newly created user details
  } catch (error) {
    console.error("Error updating or creating user:", error);
    res.status(500).json({ msg: "Server error." });
  }
};

module.exports = { getUserDetails, updateUserDetails };
