/**
 * Created by orcwarrior on 2015-02-25.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('tracksHistory', function () {
      return {
        constructor: function () {

          this.history = [];

          this.restoreLastSong = function () {
            var first = _.first(this.history);
            this.history = _.rest(this.history);
            return first;
          };
          this.storeSong = function () {
            this.history.push(song);
          }

          return this;
        }
      };
    });
})();
