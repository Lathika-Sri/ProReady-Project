const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');
const auth = require('../middleware/auth');

router.post('/start', auth, sessionController.startSession);
router.put('/end', auth, sessionController.endSession);
router.get('/active', auth, sessionController.getActiveSession);
router.get('/', auth, sessionController.getSessions);
router.get('/analytics', auth, sessionController.getAnalytics);

module.exports = router;