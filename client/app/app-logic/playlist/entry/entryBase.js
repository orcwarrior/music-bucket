/**
 * Created by orcwa on 17.11.2015.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('entryBase', function () {

      var entryBase = function entryBase() {
      };
      entryBase.prototype = {
        getNext: function () {
          return new Error("getNext method from entryBase should be implemented!");
        },
        getPlayedCount: function () {
          return this.playedCount;
        },
        getSongsCount: function () {
          return this.songsCount;
        },
        getPlaylistDescription: function () {
          if (this.getSongsCount() > 1)
            return this.shortDescription + " (" + this.getPlayedCount() + "/" + this.getSongsCount() + ")";
          else
            return this.shortDescription;
        }

      };
      return entryBase;
    });
})();
