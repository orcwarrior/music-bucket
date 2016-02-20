/**
 * Created by orcwa on 19.02.2016.
 */
'use strict';

var _ = require('lodash');
var gallerySchema = require('../../../songzaLurker/models/metaGalleryContainer.model');
var galleryTypesSchema = require('./galleryTypes.model');

exports.index = function (req, res) {
  galleryTypesSchema
    .findOne({})
    .populate('types.gallery')
    .exec(function (err, galleryTypes) {
      if (!galleryTypes) {
        gallerySchema.find({}, function (err, gallery) {
          var groupedGallery = _.groupBy(gallery, 'galleryType');
          galleryTypes = new galleryTypesSchema();
          _.each(groupedGallery, function (val, key) {
            galleryTypes.types.push({name: key, gallery: val});
          });
          galleryTypes.save(function (err, galTypes) {
            galleryTypesSchema
              .populate(galleryTypes, {path: 'types.gallery'})
              .exec(function (err, galTypes) {
                res.json(200, galleryTypes);
              });
          });
        });
      } else {
        return res.json(200, galleryTypes);
      }
    });
};

exports.byType = function (req, res) {
  if (!req.params.type) return res.json(500, {err: "type param is not defined!"});

  gallerySchema.find({galleryType: req.params.type})
    .exec(function (err, gallery) {
      if (err) return res.json(500, err);
      if (!gallery) return res.json(500, {err: "no galleries found!"});
      return res.json(200, {galleries: gallery});
    });
};
