'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema;
var _ = require('lodash');
var stationModel = require('./station.model');

var situationSchema = new Schema({
  name: {type: String},
  description: String,
  stations: [{
    type: String,
    ref: 'songzaStation'
  }],
  situations: [{
    type: Schema.ObjectId,
    ref: 'songzaSituation'
  }]
});

// processor
situationSchema.statics.create = function (situationObj, cb) {
  var schema = this;
  console.log("situationSchema.methods.create."+situationObj.id);
  if (_.isUndefined(situationObj)) return console.error("situationObj is undef!!!" + situationObj);

  this.findById(situationObj.id, function (err, situation) {
    if (err) return cb(err, situation);
    if (situation) return console.warn("there is already situation with id: " + situationObj.id);
  });

  var createdSituation = new this({});
  // create sub-sitations
  _.each(situationObj.situations, function (sit) {
    schema.create(sit, function (err, obj) {
      // if (err) console.info(err);
    });
  });
  // create stations
  console.log("situation.hasStations:"+situationObj.station_ids.length)
  _.each(situationObj.station_ids, function (station) {
    stationModel.create(station, function (err, obj) {
      if (err) console.error("Sub-station saving error: " + err);
    })
  });
  createdSituation.mapper(situationObj);
  createdSituation.save(cb);
};

function fixIdToObjId(id) {
  var isHex = (!_.isNull(id.match(new RegExp("^[0-9A-Fa-f]+$")))),
    lenghtLeft = (isHex) ? (24 - id.length) : (12 - id.length);
  /* (for longer strings)                   (for shorter) */
  return id.substring(0, id.length + lenghtLeft) + _.repeat("f", lenghtLeft);

}
situationSchema.methods.mapper = function (situationObj) {
  console.log("situationSchema.methods.mapper." + situationObj.id +"."+_.isObject(situationObj));

  // Fix when Mongoose.ObjectId is passed:
  if (_.isUndefined(situationObj.id)) situationObj = {id: situationObj.toString()}; // bugfix
  situationObj.id = fixIdToObjId(situationObj.id);
  this._id = mongoose.Types.ObjectId(situationObj.id);
  this.name = situationObj.title;
  this.description = situationObj.selected_message;
  this.stations = _.map(situationObj.station_ids, function (station) {
    return station;
  });
  this.situations = _.map(situationObj.situations, function (sit) {
    return mongoose.Types.ObjectId(sit.id);
  });
}

situationSchema.statics.findByQueryString = function (queryString) {
  var query;
  if (queryString.name) queryString.name = new RegExp(queryString.name, "i");
  if (queryString._id && queryString._id.length) queryString._id = {$in: queryString._id};
  if (queryString.q) {
    var query = queryString.q;
    delete queryString.q;
    queryString.$text = {$search: query};
    query = this.find(queryString, { score: { $meta: "textScore" }}).sort({score: {$meta: "textScore"}});
  }

  if (!query) query = this.find(queryString);
  console.log("Updated queryString: ");
  console.log(queryString);
  return query;
};


// Text index
situationSchema.index({name: "text", description: "text"}, {
  name: "best_match_index",
  weights: {
    name: 4,
    description: 1
  }
});

module.exports = mongoose.model('songzaSituation', situationSchema);
