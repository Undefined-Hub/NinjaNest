const express = require('express');
const router = express.Router();
const { getMatches } = require('./matcherController');

router.get('/match/:userId', getMatches);

module.exports = router;
