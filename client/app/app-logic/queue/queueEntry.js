/**
 * Created by orcwarrior on 2014-12-05.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('queueEntry', function (SMSoundConverter, $log) {
      return function queueEntry(song) {
        this.song = song;
      };
    }
  );
})();
