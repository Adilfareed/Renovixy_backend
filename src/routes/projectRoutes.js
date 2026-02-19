const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const { 
  getProjects, 
  createProject, 
  updateProject, 
  deleteProject, 
  getProjectById 
} = require('../controllers/projectController');
const { protect, authorize } = require('../middlewares/auth');

router.route('/')
  .get(getProjects)
  .post(protect, authorize('admin'), upload.array('images', 10), createProject);

router.route('/:id')
  .get(getProjectById)
  .put(protect, authorize('admin'), upload.array('images', 10), updateProject)
  .delete(protect, authorize('admin'), deleteProject);

module.exports = router;
