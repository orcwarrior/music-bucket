/**
 * Created by orcwa on 09.02.2016.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('songMetainfosUnresolved', function (songMetainfos) {

      var songMetainfosUnresolved = function songMetainfosUnresolved(initData) {
        if (_.isFunction(initData.getSongDescription))
          this.title = initData.getSongDescription();
        else
          this.title = (initData.artist + " - " + initData.title);
      };
      songMetainfosUnresolved.getSongDescription = function () {
      };
      songMetainfosUnresolved.prototype = new songMetainfos();
      return songMetainfosUnresolved;
    });
})();
