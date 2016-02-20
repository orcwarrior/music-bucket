'use strict';

var express = require('express');
var controller = require('./gallery.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/type/:type', controller.byType);

module.exports = router;
