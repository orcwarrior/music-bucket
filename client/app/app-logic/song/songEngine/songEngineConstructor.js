/**
 * Created by orcwarrior on 2015-03-02.
 */

(function () {
angular.module('musicBucketEngine')
  .factory('songEngineConstructor', function (songCommons, songEngineYoutube, songEngineSM2) {

    return function (metainfos, type) {
      switch (type) {
        case (songCommons.songType.youtube) :
          return new songEngineYoutube(metainfos);
        default :
          return new songEngineSM2(metainfos);
      }
    };

  });
})();
