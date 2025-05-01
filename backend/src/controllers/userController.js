const User = require("../models/User");

// ! Fetch user details
const fetchUser = async (req, res) => {
  const username = req.params.username;
  try {
    // ! Check if user already exists
    const userExists = await User.findOne({ username });
    if (!userExists) {
      return res.status(400).json({ message: "User doesn't exist" });
    }
    // ! Remove password field before sending the response
    const { password, createdAt, updatedAt, __v, ...userWithoutPassword } = userExists.toObject();
    res.status(200).json({ user: userWithoutPassword});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ! Update user details
const updateUser = async (req, res) => {
  const id = req.params.id;

  try {
    // ! Prevent users from updating email & username
    const { email, username, ...updateData } = req.body;

    const user = await User.findOneAndUpdate(
      { _id: id },
      updateData, // ! Only update allowed fields
      { new: true } // ! Returns the updated document
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // ! Password hash should not be sent in response
    user.password = undefined;

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

module.exports = {
  fetchUser,
  updateUser,
};
