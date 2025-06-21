const router = require('express').Router();
const { body, param } = require('express-validator');
const { auth, adminOnly } = require('../middlewares');
const {
  listUsers,
  updateUser,
  listResumes,
  updateResume,
  viewLogs,
  getSettings,
  updateSettings,
  toggleFeature,
  listFeatures,
  analytics,
} = require('../controllers/adminController');

router.use(auth, adminOnly);

router.get('/users', listUsers);
router.put('/users/:id', param('id').isMongoId(), body('name').optional(), updateUser);

router.get('/resumes', listResumes);
router.put('/resumes/:id', param('id').isMongoId(), updateResume);

router.get('/logs', viewLogs);

router.get('/features', listFeatures);

router.get('/settings', getSettings);
router.post('/settings', updateSettings);
router.post('/features/:key/toggle', toggleFeature);

router.get('/analytics', analytics);

module.exports = router;
