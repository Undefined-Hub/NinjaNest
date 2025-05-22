const express = require('express');
const requestController = require('../controllers/requestController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// POST route to create a new request
router.post('/', authMiddleware(),requestController.createRequest);

// GET route to fetch all requests
router.get('/', authMiddleware(),requestController.getAllRequests);

// GET route to fetch a single request by ID
router.get('/:id', authMiddleware(),requestController.getRequestById);

// PUT route to update a request by ID
router.put('/:id', authMiddleware(),requestController.updateRequest);

// DELETE route to delete a request by ID
router.delete('/:id', authMiddleware(),requestController.deleteRequest);

// GET route perform invitation acceptance operation
router.get('/invitation/:invitationId/:action', requestController.handleInvitationResponse);


module.exports = router;