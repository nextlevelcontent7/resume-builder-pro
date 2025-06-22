const router = require('express').Router();
const ai = require('../template-ai/api/generate');

router.use('/', ai);

module.exports = router;
