/**
 * Created by orcwa on 22.12.2015.
 */

var express = require('express');
var router = express.Router();
var lurker = require('./index');

router.get('/', lurker.test1);
router.get('/2', lurker.test2);
router.get('/run', lurker.init);
router.get('/stats', lurker.getStats);

var exports = module.exports = router;
