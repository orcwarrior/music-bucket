/**
 * Created by orcwarrior on 2015-03-23.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('songMetainfosYoutube', function (songMetainfos) {

      var songMetainfosYoutube = function songMetainfosYoutube(providedInfos) {
        if (_.isObject(providedInfos)) {
          this.id = providedInfos.id.videoId;
          this.title = providedInfos.snippet.title;
        } else {
          this.id = providedInfos;
        }
        this.url = "http://youtube.com/?watch=" + this.id;
        this.getUrl = function () { return this.url; };
      };
      songMetainfosYoutube.prototype = new songMetainfos();
      return songMetainfosYoutube;
    });
})();
