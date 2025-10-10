const express = require('express');
const router = express.Router();
const controller = require('../controllers/product.controller');

router.get('/:id', controller.getProduct);
router.post('/', controller.createProduct);
router.post('/:id/stages', controller.addStage);

module.exports = router;
