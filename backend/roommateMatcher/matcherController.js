const { findMatches } = require("./matcherService");

const getMatches = (req, res) => {
  const { userId } = req.params;

  findMatches(userId, (matches) => {
    if (matches.length === 0)
      return res
        .status(404)
        .json({ message: "User not found or no matches available" });

    // Format the response to include compatibility score and details
    const formattedMatches = matches.map((match) => ({
      userId: match.userId,
      name: match.name,
      course: match.course,
      year: match.year,
      college: match.college,
      compatibilityScore: match.score,
      compatibilityDetails: match.compatibilityDetails,
      interests: match.interests ? match.interests.split("|") : [],
      lifestyle: {
        smoking: match.smoking,
        sleepSchedule: match.sleepSchedule,
        cleanliness: match.cleanliness,
        guests: match.guests,
        noiseTolerance: match.noiseTolerance,
        dietaryPreference: match.dietaryPreference,
        alcoholConsumption: match.alcoholConsumption,
        partying: match.partying,
      },
      budget: match.budget,
    }));

    res.status(200).json({
      matches: formattedMatches,
      totalMatches: formattedMatches.length,
    });
  });
};

module.exports = { getMatches };
