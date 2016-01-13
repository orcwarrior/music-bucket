'use strict';

var mongoose = require('mongoose'),
  Schema = mongoose.Schema,
  stationModel = require('./station.model'),
  _ = require('lodash');

var metaGalleryContainer = new Schema({
  _id: String,
  galleryType: String,//, enum: ['activity', 'decades', 'generes', 'moods']},
  name: {type: String, required: true},
  stations: [{
    type: String,
    ref: 'songzaStation'
  }],
  tags: [{type: String}]
});
metaGalleryContainer.methods.mapper = function (galleryType, galleryObj) {
  console.log("metaGalleryContainer.methods.mapper");
  this._id = galleryObj.id;
  this.name = galleryObj.name;
  this.stations = _.map(galleryObj.station_ids, function (sId) {
    return sId.toString();
  });
  if (!_.isUndefined(galleryObj.keywords))
    this.tags = galleryObj.keywords.split(", ");
  this.galleryType = galleryType.toLowerCase();
};
metaGalleryContainer.statics.create = function (galleryType, galleryObj, cb) {
  console.log("metaGalleryContainer.statics.create");
  var schema = this;
  this.findById(galleryObj.id, function (err, gallery) {
    if (err) return cb(err, gallery);
    if (gallery) return cb(new Error("There is already gallery with id: " + gallery));

    // create stations
    _.each(galleryObj.station_ids, function (station) {
      stationModel.create(station, function (err, obj) {
        // if (err) console.error("Sub-station saving error: " + err);
      });
    });
    var createdGallery = new schema({});
    createdGallery.mapper(galleryType, galleryObj);
    createdGallery.save(cb);
  });
};

module.exports = mongoose.model('songzaMetaGalleryContainer', metaGalleryContainer, 'songzaMetaGalleryContainer');
