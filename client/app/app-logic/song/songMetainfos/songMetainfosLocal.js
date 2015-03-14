/**
 * Created by orcwarrior on 2015-03-02.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songMetainfosLocal', function (songMetainfos, ngAudioMetadataParser) {

      /* private methods */
      function setupID3Tags(metadata) {
        this.artist = metadata.artist;
        this.title = metadata.title;
        this.album = metadata.album;
        this.year = metadata.year;
        // Load albumArt:
        if (_.isUndefined(metadata.picture)) return;
        var urlCreator = window.URL || window.webkitURL;
        this.albumArt = urlCreator.createObjectURL( metadata.picture );
      }

      var songMetainfosLocal = function songMetainfosLocal(src) {
        this.id = "LF-" + src.name;
        this.title = src.name.substr(0, src.name.lastIndexOf('.'));
        this.url = URL.createObjectURL(src);
        this.type = "audio/" + src.name.substr(src.name.lastIndexOf('.') + 1);
        this.getUrl = function () { return this.url; };

        ngAudioMetadataParser(src, _.bind(setupID3Tags, this));
      }
      songMetainfosLocal.prototype = new songMetainfos();
      return songMetainfosLocal;

    });
})();
