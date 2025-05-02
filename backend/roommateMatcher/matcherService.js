const fs = require("fs");
const csv = require("csv-parser");

// Helper: convert categorical fields to numerical score
const encode = (val, map) => map[val] || 0;

const calculateSimilarity = (userA, userB) => {
  let score = 0;

  // Encoding maps
  const yesNo = { no: 0, yes: 1 };
  const sleepMap = { early: 0, late: 1 };
  const cleanMap = { low: 0, medium: 1, high: 2 };
  const guestMap = { never: 0, rarely: 1, often: 2 };
  const noiseMap = { low: 0, medium: 1, high: 2 };

  score += userA.course === userB.course ? 1 : 0;
  score += Math.abs(userA.year - userB.year) <= 1 ? 1 : 0;
  score +=
    encode(userA.smoking, yesNo) === encode(userB.smoking, yesNo) ? 1 : 0;
  score +=
    encode(userA.sleepSchedule, sleepMap) ===
    encode(userB.sleepSchedule, sleepMap)
      ? 1
      : 0;
  score +=
    Math.abs(
      encode(userA.cleanliness, cleanMap) - encode(userB.cleanliness, cleanMap)
    ) <= 1
      ? 1
      : 0;
  score +=
    Math.abs(encode(userA.guests, guestMap) - encode(userB.guests, guestMap)) <=
    1
      ? 1
      : 0;
  score +=
    Math.abs(
      encode(userA.noiseTolerance, noiseMap) -
        encode(userB.noiseTolerance, noiseMap)
    ) <= 1
      ? 1
      : 0;
  score += Math.abs(userA.budget - userB.budget) <= 2000 ? 1 : 0;

  return score;
};

const findMatches = (targetUserId, callback) => {
  const users = [];

  fs.createReadStream("./roommateMatcher/sampleUsers.csv")
    .pipe(csv())
    .on("data", (data) =>
      users.push({
        ...data,
        year: Number(data.year),
        budget: Number(data.budget),
      })
    )
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
        }))
        .sort((a, b) => b.score - a.score);

      callback(matches.slice(0, 5));
    });
};

module.exports = { findMatches };
