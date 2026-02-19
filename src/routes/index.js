const express = require('express');
const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/users', require('./userRoutes'));
router.use('/orders', require('./orderRoutes'));
router.use('/services', require('./serviceRoutes'));
router.use('/service-categories', require('./serviceCategoryRoutes'));
router.use('/projects', require('./projectRoutes'));

module.exports = router;
