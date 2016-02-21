/**
 * Created by orcwarrior on 2015-03-02.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songMetainfos', function () {
      var songMetainfosFunc = function songMetainfos(srcMetainfos) {
        if (!_.isUndefined(srcMetainfos)) {
          this.id = srcMetainfos.id;
          this.artist = srcMetainfos.artist;
          this.title = srcMetainfos.title;
          this.album = srcMetainfos.album;
          this.albumArt = srcMetainfos.albumArt;
          this.genere = srcMetainfos.genere;
          this.title = srcMetainfos.title;
          this.trackNo = srcMetainfos.trackNo;
        }

        this.getSrc = function () {
          return this.url;
        };
        this.getSongDescription = function () {
          if (this.title === '' || _.isUndefined(this.title))
            return this.id;
          if (this.artist === '' || _.isUndefined(this.artist))
            return this.title;
          else return this.artist + ' - ' + this.title;
        };
        this.resolve = function () {
          return;
        };
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
            'trackNo',
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
            'trackNo',
            'metainfosAsResponse']
        }
      };

      return songMetainfosFunc;

    });
})();
