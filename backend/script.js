const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

// Sample interests to randomly assign to users
const interestsList = [
  'coding', 'gaming', 'reading', 'movies', 'sports', 'cooking', 
  'travel', 'music', 'art', 'photography', 'dance', 'hiking', 
  'swimming', 'yoga', 'meditation', 'fashion', 'design', 'business',
  'entrepreneurship', 'writing', 'blogging', 'vlogging', 'anime',
  'singing', 'instruments', 'theatre', 'acting', 'gardening'
];

// Sample music preferences
const musicList = [
  'pop', 'rock', 'indie', 'classical', 'jazz', 'metal', 'rap', 
  'hiphop', 'edm', 'country', 'blues', 'folk', 'bollywood'
];

// Helper function to get random items from an array
const getRandomItems = (arr, count) => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};

// Helper function to generate a pipe-separated string of random interests
const generateInterests = () => {
  const count = Math.floor(Math.random() * 5) + 1; // 1-5 interests
  return getRandomItems(interestsList, count).join('|');
};

// Helper function to generate a pipe-separated string of random music preferences
const generateMusicPreferences = () => {
  const count = Math.floor(Math.random() * 3) + 1; // 1-3 genres
  return getRandomItems(musicList, count).join('|');
};

// Generate random values for user profile data
const generateRandomUserData = () => {
  const values = {
    smoking: Math.random() > 0.7 ? 'yes' : 'no',
    sleepSchedule: Math.random() > 0.5 ? 'early' : 'late',
    cleanliness: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    guests: ['never', 'rarely', 'often'][Math.floor(Math.random() * 3)],
    noiseTolerance: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
    budget: Math.floor(Math.random() * 15000) + 3000, // 3000-18000
    studyHabits: ['regular', 'occasional', 'cramming'][Math.floor(Math.random() * 3)],
    interests: generateInterests(),
    dietaryPreference: Math.random() > 0.5 ? 'vegetarian' : 'non-vegetarian',
    personalityType: ['introvert', 'ambivert', 'extrovert'][Math.floor(Math.random() * 3)],
    musicPreference: generateMusicPreferences(),
    gymFrequency: ['never', 'rarely', 'weekly', 'daily'][Math.floor(Math.random() * 4)],
    sharedItems: ['none', 'kitchen', 'bathroom', 'kitchen|bathroom', 'all'][Math.floor(Math.random() * 5)],
    alcoholConsumption: ['never', 'rarely', 'often'][Math.floor(Math.random() * 3)],
    partying: ['never', 'rarely', 'monthly', 'weekly'][Math.floor(Math.random() * 4)]
  };
  
  return values;
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => {
  console.log('Connected to MongoDB');
  updateUsers();
})
.catch(err => {
  console.error('Error connecting to MongoDB:', err);
  process.exit(1);
});

// Main function to update users
async function updateUsers() {
  try {
    // Get all users
    const users = await User.find({});
    console.log(`Found ${users.length} users to update`);
    
    let updatedCount = 0;
    
    // Update each user
    for (const user of users) {
      // Generate random profile data
      const profileData = generateRandomUserData();
      
      // Update user with new data
      await User.findByIdAndUpdate(user._id, profileData);
      updatedCount++;
      
      console.log(`Updated user ${user.name} (${updatedCount}/${users.length})`);
    }
    
    console.log(`Successfully updated ${updatedCount} users with roommate preferences data`);
    process.exit(0);
  } catch (error) {
    console.error('Error updating users:', error);
    process.exit(1);
  }
}
