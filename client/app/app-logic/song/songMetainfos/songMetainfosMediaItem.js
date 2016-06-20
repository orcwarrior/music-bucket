/**
 * Created by orcwarrior on 2015-03-02.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songMetainfosMediaItem', function (songMetainfos) {
      var songMetainfosMediaItem = function songMetainfosMediaItem(src) {
        if (!src) return;

        this.id = src.id;
        this.artist = src.artist;
        this.title = src.title || src.name;
        this.album = src.album;
        this.albumArt = src.cover;
        this.url = src.url;
        this.getUrl = function () { return this.url;};
      };
      songMetainfosMediaItem.prototype = new songMetainfos();
      return songMetainfosMediaItem;

    });
})();
