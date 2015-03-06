/**
 * Created by orcwarrior on 2015-03-02.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songMetainfos', function () {
      return function songMetainfos() {
        this.id = undefined;
        this.artist = "";
        this.title = "";
        this.album = undefined;
        this.albumArt = undefined;
        this.genere = "";
        this.getSrc = function () { throw new Error("Base method should be overriden!"); };
        this.getSongDescription = function () {
            if (this.artist === '')
              return this.title;
            else return this.artist + ' - ' + this.title;
          }
      }

    });
})();
