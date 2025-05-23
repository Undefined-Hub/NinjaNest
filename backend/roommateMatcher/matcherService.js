const fs = require("fs");
const csv = require("csv-parser");

// Helper: convert categorical fields to numerical score
const encode = (val, map) => map[val] || 0;

// Helper: calculate common interests score
const calculateInterestScore = (userAInterests, userBInterests) => {
  if (!userAInterests || !userBInterests) return 0;
  
  const interestsA = userAInterests.split('|');
  const interestsB = userBInterests.split('|');
  
  const commonInterests = interestsA.filter(interest => interestsB.includes(interest));
  
  // Score based on percentage of common interests
  return (commonInterests.length / Math.max(interestsA.length, interestsB.length)) * 3;
}; // Added missing closing curly brace here

// Helper: calculate common music preferences
const calculateMusicScore = (userAMusic, userBMusic) => {
  if (!userAMusic || !userBMusic) return 0;
  
  const musicA = userAMusic.split('|');
  const musicB = userBMusic.split('|');
  
  const commonMusic = musicA.filter(genre => musicB.includes(genre));
  
  // Return 1 if at least one genre matches, otherwise 0
  return commonMusic.length > 0 ? 1 : 0;
};

const calculateSimilarity = (userA, userB) => {
  let score = 0;
  let maxScore = 0;
  
  // Encoding maps
  const yesNo = { no: 0, yes: 1 };
  const sleepMap = { early: 0, late: 1 };
  const cleanMap = { low: 0, medium: 1, high: 2 };
  const guestMap = { never: 0, rarely: 1, often: 2 };
  const noiseMap = { low: 0, medium: 1, high: 2 };
  const studyMap = { regular: 2, occasional: 1, cramming: 0 };
  const personalityMap = { introvert: 0, ambivert: 1, extrovert: 2 };
  const dietaryMap = { vegetarian: 0, non_vegetarian: 1 };
  const frequencyMap = { never: 0, rarely: 1, monthly: 2, weekly: 3, daily: 4 };
  const sharedItemsMap = { none: 0, kitchen: 1, bathroom: 1, "kitchen|bathroom": 2, all: 3 };
  
  // Academic compatibility (higher weight for course match)
  if (userA.course === userB.course) {
    score += 2;
  }
  maxScore += 2;
  
  // Year proximity (higher weight for similar academic year)
  if (Math.abs(Number(userA.year) - Number(userB.year)) <= 1) {
    score += 1.5;
  }
  maxScore += 1.5;
  
  // Smoking habits (critical compatibility factor)
  if (encode(userA.smoking, yesNo) === encode(userB.smoking, yesNo)) {
    score += 2;
  }
  maxScore += 2;
  
  // Sleep schedule
  if (encode(userA.sleepSchedule, sleepMap) === encode(userB.sleepSchedule, sleepMap)) {
    score += 1.5;
  }
  maxScore += 1.5;
  
  // Cleanliness compatibility
  const cleanlinessA = encode(userA.cleanliness, cleanMap);
  const cleanlinessB = encode(userB.cleanliness, cleanMap);
  if (Math.abs(cleanlinessA - cleanlinessB) <= 1) {
    score += 1.5 - (Math.abs(cleanlinessA - cleanlinessB) * 0.5);
  }
  maxScore += 1.5;
  
  // Guest preferences
  const guestsA = encode(userA.guests, guestMap);
  const guestsB = encode(userB.guests, guestMap);
  if (Math.abs(guestsA - guestsB) <= 1) {
    score += 1 - (Math.abs(guestsA - guestsB) * 0.3);
  }
  maxScore += 1;
  
  // Noise tolerance
  const noiseA = encode(userA.noiseTolerance, noiseMap);
  const noiseB = encode(userB.noiseTolerance, noiseMap);
  if (Math.abs(noiseA - noiseB) <= 1) {
    score += 1.5 - (Math.abs(noiseA - noiseB) * 0.5);
  }
  maxScore += 1.5;
  
  // Budget compatibility (within 20% of each other)
  const budgetA = Number(userA.budget);
  const budgetB = Number(userB.budget);
  const budgetDiff = Math.abs(budgetA - budgetB);
  const budgetAvg = (budgetA + budgetB) / 2;
  if (budgetDiff / budgetAvg <= 0.2) {
    score += 1.5;
  } else if (budgetDiff / budgetAvg <= 0.4) {
    score += 0.75;
  }
  maxScore += 1.5;
  
  // Study habits
  const studyA = encode(userA.studyHabits, studyMap);
  const studyB = encode(userB.studyHabits, studyMap);
  if (Math.abs(studyA - studyB) <= 1) {
    score += 1;
  }
  maxScore += 1;
  
  // Shared interests
  const interestScore = calculateInterestScore(userA.interests, userB.interests);
  score += interestScore;
  maxScore += 3; // Max interest score is 3
  
  // Dietary preferences
  if (encode(userA.dietaryPreference, dietaryMap) === encode(userB.dietaryPreference, dietaryMap)) {
    score += 0.5;
  }
  maxScore += 0.5;
  
  // Personality compatibility (introverts with introverts, extroverts with extroverts)
  const personalityA = encode(userA.personalityType, personalityMap);
  const personalityB = encode(userB.personalityType, personalityMap);
  if (Math.abs(personalityA - personalityB) <= 1) {
    score += 1;
  }
  maxScore += 1;
  
  // Music preferences
  score += calculateMusicScore(userA.musicPreference, userB.musicPreference);
  maxScore += 1;
  
  // Gym frequency
  const gymA = encode(userA.gymFrequency, frequencyMap);
  const gymB = encode(userB.gymFrequency, frequencyMap);
  if (Math.abs(gymA - gymB) <= 1) {
    score += 0.5;
  }
  maxScore += 0.5;
  
  // Willingness to share items
  const shareA = encode(userA.sharedItems, sharedItemsMap);
  const shareB = encode(userB.sharedItems, sharedItemsMap);
  score += Math.min(shareA, shareB) * 0.25;
  maxScore += 0.75;
  
  // Alcohol consumption
  const alcoholA = encode(userA.alcoholConsumption, frequencyMap);
  const alcoholB = encode(userB.alcoholConsumption, frequencyMap);
  if (Math.abs(alcoholA - alcoholB) <= 1) {
    score += 0.75;
  }
  maxScore += 0.75;
  
  // Partying frequency
  const partyA = encode(userA.partying, frequencyMap);
  const partyB = encode(userB.partying, frequencyMap);
  if (Math.abs(partyA - partyB) <= 1) {
    score += 0.75;
  }
  maxScore += 0.75;
  
  // Normalize score to a percentage (0-100)
  return Math.round((score / maxScore) * 100);
};

const findMatches = (targetUserId, callback) => {
  const users = [];

  fs.createReadStream("./roommateMatcher/sampleUsers.csv")
    .pipe(csv())
    .on("data", (data) => {
      users.push({
        ...data,
        year: Number(data.year),
        budget: Number(data.budget),
      });
    })
    .on("end", () => {
      const targetUser = users.find((u) => u.userId === targetUserId);
      if (!targetUser) return callback([]);

      const matches = users
        .filter(
          (u) => u.userId !== targetUserId && u.college === targetUser.college
        )
        .map((u) => ({
          ...u,
          score: calculateSimilarity(targetUser, u),
          compatibilityDetails: generateCompatibilityDetails(targetUser, u)
        }))
        .sort((a, b) => b.score - a.score);

      callback(matches.slice(0, 5));
    });
};

// Generate detailed compatibility information
const generateCompatibilityDetails = (userA, userB) => {
  const details = {
    strengths: [],
    differences: []
  };
  
  // Check lifestyle compatibility
  if (userA.smoking === userB.smoking) {
    details.strengths.push("Same smoking preferences");
  } else {
    details.differences.push("Different smoking preferences");
  }
  
  if (userA.sleepSchedule === userB.sleepSchedule) {
    details.strengths.push("Compatible sleep schedules");
  } else {
    details.differences.push("Different sleep schedules");
  }
  
  if (Math.abs(encode(userA.cleanliness, {low: 0, medium: 1, high: 2}) - 
              encode(userB.cleanliness, {low: 0, medium: 1, high: 2})) <= 1) {
    details.strengths.push("Similar cleanliness standards");
  } else {
    details.differences.push("Very different cleanliness expectations");
  }
  
  // Check academic compatibility
  if (userA.course === userB.course) {
    details.strengths.push("Same course of study");
  }
  
  if (Math.abs(Number(userA.year) - Number(userB.year)) <= 1) {
    details.strengths.push("Similar academic year");
  }
  
  // Check interest compatibility
  if (userA.interests && userB.interests) {
    const interestsA = userA.interests.split('|');
    const interestsB = userB.interests.split('|');
    const commonInterests = interestsA.filter(interest => interestsB.includes(interest));
    
    if (commonInterests.length > 0) {
      details.strengths.push(`Common interests: ${commonInterests.join(', ')}`);
    }
  }
  
  // Check budget compatibility
  const budgetDiff = Math.abs(Number(userA.budget) - Number(userB.budget));
  const budgetAvg = (Number(userA.budget) + Number(userB.budget)) / 2;
  
  if (budgetDiff / budgetAvg <= 0.2) {
    details.strengths.push("Compatible budget expectations");
  } else if (budgetDiff / budgetAvg > 0.4) {
    details.differences.push("Significant budget difference");
  }
  
  return details;
};

module.exports = { findMatches };