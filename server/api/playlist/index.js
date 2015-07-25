'use strict';

var express = require('express');
var controller = require('./playlist.controller');
var auth = require('../../auth/auth.service');

var router = express.Router();

router.get('/', auth.extractUser() , controller.index);
router.get('/:id', controller.show);
router.post('/', controller.create);
router.put('/:id', auth.isAuthenticated(), controller.update);
router.patch('/:id', auth.isAuthenticated(), controller.update);
router.delete('/:id', auth.isAuthenticated(), controller.destroy);
router.post('/:id/advanceTimer', controller.advanceTimer);

module.exports = router;
