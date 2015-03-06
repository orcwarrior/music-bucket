/**
 * Created by orcwarrior on 2015-03-02.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songMetainfosLocal', function (songMetainfos) {

      /* private methods */
      function loadId3Tags(file, songMetainfos) {
        ID3.loadTags(file.name, function () {
          var tags;
          tags = ID3.getAllTags(file.name);
          id3ToShared(tags, songMetainfos);
        }, {dataReader: FileAPIReader(file)});
      }

      function id3ToShared(id3, songMetainfos) {
        if (_.isUndefined(id3)) return;

        if (!_.isUndefined(id3.artist))
          songMetainfos.artist = id3.artist.toString();
        if (!_.isUndefined(id3.title))
          songMetainfos.title = id3.title.toString();
        if (!_.isUndefined(id3.album))
          songMetainfos.album = id3.album.toString();
        if (!_.isUndefined(id3.genere))
          songMetainfos.genere = id3.genere.toString();
        if (!_.isUndefined(id3.picture)) {
          var image = id3.picture;
          songMetainfos.albumArtAttached = true;
          songMetainfos.albumArt = (function () {
            var base64String = "";
            for (var i = 0; i < image.data.length; i++) {
              base64String += String.fromCharCode(image.data[i]);
            }
            return "data:" + image.format + ";base64," + window.btoa(base64String);
          })();
        }
        ;
      }


      var songMetainfosLocal = function songMetainfosLocal(src) {
        this.id = "LF-" + src.name;
        this.title = src.name.substr(0, src.name.lastIndexOf('.'));
        this.url = URL.createObjectURL(src);
        this.type = "audio/" + src.name.substr(src.name.lastIndexOf('.') + 1);
        this.getUrl = function () { return this.url;};

        loadId3Tags(src, this);
      }
      songMetainfosLocal.prototype = new songMetainfos();
      return songMetainfosLocal;

    });
})();
