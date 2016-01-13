/**
 * Created by orcwarrior on 2015-03-02.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songMetainfos', function () {
      var songMetainfosFunc = function songMetainfos(srcMetainfos) {
        this.id = undefined;
        this.artist = "";
        this.title = "";
        this.album = undefined;
        this.albumArt = undefined;
        this.genere = "";
        this.getSrc = function () {
          return this.url;
        };
        this.getSongDescription = function () {
          if (this.title === '')
            return this.id;
          if (this.artist === '')
            return this.title;
          else return this.artist + ' - ' + this.title;
        }

        if (!_.isUndefined(srcMetainfos)) {
          _.extendOwn(this, srcMetainfos);
        }
      }

      songMetainfosFunc.prototype.__models__ = {
        db: {
          base: "songMetainfos",
          pickedFields: [
            'id',
            'artist',
            'title',
            'album',
            'albumArt',
            'genere',
            'url']
        },
        cookies: {
          base: "songMetainfos",
          pickedFields: [
            'id',
            'artist',
            'title',
            'album',
            'albumArt',
            'genere',
            'url']
        }
      };

      return songMetainfosFunc;

    });
})();
