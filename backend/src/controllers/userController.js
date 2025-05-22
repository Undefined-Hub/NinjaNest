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
    const { password, createdAt, updatedAt, __v, ...userWithoutPassword } =
      userExists.toObject();
    res.status(200).json({ user: userWithoutPassword });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ! Search users by query
const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: "Search query is required" });
    }
    
    // Skip the currently logged in user
    const currentUserId = req.user._id;
    
    // Create a regex for case-insensitive search
    const searchRegex = new RegExp(query.trim(), 'i');
    
    // Find users matching the search query by name, email, or username
    // Don't include the current user in results
    const users = await User.find({
      $and: [
        { _id: { $ne: currentUserId } }, // Exclude the current user
        {
          $or: [
            { name: searchRegex },
            { email: searchRegex },
            { username: searchRegex }
          ]
        }
      ]
    })
    .select("name username email profilePicture course") // Only return necessary fields
    .limit(10); // Limit results to prevent performance issues
    
    res.status(200).json({ users });
  } catch (error) {
    console.error("Search users error:", error);
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
  searchUsers,
};
