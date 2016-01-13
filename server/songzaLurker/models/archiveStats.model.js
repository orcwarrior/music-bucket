/**
 * Created by orcwa on 06.01.2016.
 */

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var archiveStats = new Schema({
  archiveProgresses: [{val: Number, day: Number}]
});

module.exports = mongoose.model('archiveStats', archiveStats);
