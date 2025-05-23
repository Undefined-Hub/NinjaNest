const { findMatches } = require('./matcherService');

const getMatches = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Call the updated findMatches function that returns a promise
    const matches = await findMatches(userId);
    
    if (!matches || matches.length === 0) {
      return res.status(404).json({ 
        message: 'User not found or no matches available',
        matches: [],
        totalMatches: 0
      });
    }
    
    // Return the matches
    res.status(200).json({ 
      matches,
      totalMatches: matches.length 
    });
  } catch (error) {
    console.error('Error in getMatches controller:', error);
    res.status(500).json({ 
      message: 'Server error when finding matches',
      error: error.message
    });
  }
};

module.exports = { getMatches };