const express = require('express');
const {
    createIntervention,
    getStudentInterventions,
    getMyInterventions,
    updateIntervention,
    addNote,
    deleteIntervention
} = require('../controllers/interventionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { audit } = require('../middleware/auditMiddleware');

const router = express.Router();

// Mentor routes
router.post('/', protect, authorize('mentor'), audit('CREATE_INTERVENTION'), createIntervention);
router.get('/my-interventions', protect, authorize('mentor'), getMyInterventions);
router.get('/student/:studentId', protect, getStudentInterventions);
router.put('/:id', protect, authorize('mentor'), audit('UPDATE_INTERVENTION'), updateIntervention);
router.post('/:id/notes', protect, authorize('mentor'), audit('ADD_NOTE'), addNote);
router.delete('/:id', protect, authorize('mentor'), audit('DELETE_INTERVENTION'), deleteIntervention);

module.exports = router;
