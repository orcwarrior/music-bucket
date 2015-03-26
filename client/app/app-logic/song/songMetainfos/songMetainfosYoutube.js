/**
 * Created by orcwarrior on 2015-03-23.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('songMetainfosYoutube', function (songMetainfos) {

      var songMetainfosYoutube = function songMetainfosYoutube(id) {
        this.id = id;
        this.url = "http://youtube.com/?watch=" + id;
        this.getUrl = function () { return this.url; };
      };
      songMetainfosYoutube.prototype = new songMetainfos();
      return songMetainfosYoutube;

    });
})();
