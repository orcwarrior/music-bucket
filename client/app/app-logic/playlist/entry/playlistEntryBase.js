/**
 * Created by orcwarrior on 2015-03-05.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('playlistEntryBase', function () {

      return function playlistEntryBase() {
        entryType    = {local: "tLocal", songza: "tSongzaStation"};
        getPlaylistDescription = function () {
          return this.shortDescription;
        };
      };
    });
}
)();
