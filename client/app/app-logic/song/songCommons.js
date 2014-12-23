/**
 * Created by orcwarrior on 2014-11-08.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songCommons', function () {
               var guid = (function () {
                 function s4() {
                   return Math.floor((1 + Math.random()
                                     ) * 0x10000)
                     .toString(16)
                     .substring(1);
                 }
               }
               )();
               return {
                 songType    : {songza: 0, local: 1, spotify: 2},
                 generateGUID: function () {
                   return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                     s4() + '-' + s4() + s4() + s4();
                 },
                 sharedProto : {
                   id3ToShared: function () {
                     if (_.isUndefined(this.id3)) return;

                     if (!_.isUndefined(this.id3.artist))
                      this.artist = this.id3.artist.toString();
                     if (!_.isUndefined(this.id3.title))
                       this.title = this.id3.title.toString();
                     if (!_.isUndefined(this.id3.album))
                       this.album = this.id3.album.toString();
                     if (!_.isUndefined(this.id3.genere))
                       this.genere = this.id3.genere.toString();
                     if (!_.isUndefined(this.id3.picture)) {

                       var image = this.id3.picture;
                       this.albumArt = (function() {
                         var base64String = "";
                         for (var i = 0; i < image.data.length; i++) {
                           base64String += String.fromCharCode(image.data[i]);
                         }
                         return "data:" + image.format + ";base64," + window.btoa(base64String);
                       })();
                     };
                   },
                   getSongDescription : function() {
                     if(this.artist === '')
                       return this.title;
                     else return this.artist + ' - ' + this.title;
                   }
                 }
               }
  });
})();
