/**
 * Created by orcwarrior on 2015-03-02.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songMetainfos', function () {
      var songMetainfosFunc = function songMetainfos(srcMetainfos) {
      //  this.id = undefined;
      //  this.artist = "";
      //  this.title = "";
      //  this.album = undefined;
      //  this.albumArt = undefined;
      //  this.genere = "";
        this.getSrc =  function () {
          return this.url;
        };
        this.getSongDescription = function () {
          if (this.title === '' || _.isUndefined(this.title))
            return this.id;
          if (this.artist === '' || _.isUndefined(this.artist))
            return this.title;
          else return this.artist + ' - ' + this.title;
        }
        // this hacky-fix will cause restoring from db/cookie model to create proper metainfos otrue;
        // (see song.js)
        this.metainfosAsResponse = true;

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
            'url',
            'metainfosAsResponse']
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
            'url',
            'metainfosAsResponse']
        }
      };

      return songMetainfosFunc;

    });
})();
