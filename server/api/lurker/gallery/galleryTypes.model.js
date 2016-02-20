
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

var galleryTypesSchema = new Schema({
  types: [{
    name: String,
    gallery: [{ type: String, ref: 'songzaMetaGalleryContainer' }]
  }]
});


module.exports = mongoose.model('galleryTypes', galleryTypesSchema, 'galleryType');
