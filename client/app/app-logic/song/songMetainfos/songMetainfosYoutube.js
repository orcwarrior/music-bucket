/**
 * Created by orcwarrior on 2015-03-23.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('songMetainfosYoutube', function (songMetainfos) {

      var songMetainfosYoutube = function songMetainfosYoutube(providedInfos) {
        if (_.isObject(providedInfos)) {
          var combTitle = providedInfos.snippet.title;
          this.id = providedInfos.id.videoId;
          this.artist = combTitle.split('-')[0];
          this.title = combTitle.split('-')[1];
        } else {
          this.id = providedInfos;
        }
        this.albumArt = "http://img.youtube.com/vi/"+this.id+"/hqdefault.jpg";
        this.url = "http://youtube.com/?watch=" + this.id;
        this.getUrl = function () { return this.url; };
      };
      songMetainfosYoutube.extractArtistAndTitle = function(videoTitle) {
        var res = {artist:'', title:''};
        res.artist = videoTitle.split(' -')[0].trim();
        res.title = videoTitle.split(' -')[1].trim();
        return res;
      };
      songMetainfosYoutube.prototype = new songMetainfos();
      return songMetainfosYoutube;
    });
})();
