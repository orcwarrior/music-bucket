/**
 * Created by orcwarrior on 2015-03-23.
 */

angular.module('musicBucketEngine')
  .factory('playbackErrorTypes', function() {
      return {
        "youtube" : 0,
        "sm2" : 1
      };
  })
  .factory('playbackError', function () {

    return function playbackError(type, songId, details) {
      this.type = type;
      this.songId = songId;
      this.details = details;
    };
  });
