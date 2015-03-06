/**
 * Created by orcwarrior on 2015-02-26.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songUnresolved', function (songControllsInterface) {
      var songUnresolved = function(response, type, resolveFunction) {
        this.resolve = _.bind(resolveFunction, this, response, type)
        this.response = response;
        this.type = type;

      }
      songUnresolved.prototype = new songControllsInterface(function() {
        console.log("songUnresolved controlls called");
        console.log(_.last(arguments));
         this.resolve();
      });

      return songUnresolved;
    });
})();
