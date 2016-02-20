/**
 * Created by orcwa on 19.02.2016.
 */

var express = require('express');
var router = express.Router();
var controller = require('./station.controller');

router.get('/search', controller.search);
router.get('/:id', controller.get);

module.exports = router;
