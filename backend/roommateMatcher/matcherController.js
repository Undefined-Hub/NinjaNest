const { findMatches } = require('./matcherService');

const getMatches = (req, res) => {
  const { userId } = req.params;

  findMatches(userId, (matches) => {
    if (matches.length === 0) return res.status(404).json({ message: 'User not found' });
    res.status(200).json({ matches });
  });
};

module.exports = { getMatches };
