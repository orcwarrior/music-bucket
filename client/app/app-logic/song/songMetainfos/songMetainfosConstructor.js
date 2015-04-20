/**
 * Created by orcwarrior on 2015-03-02.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songMetainfosConstructor', function (songCommons, songMetainfosSongza, songMetainfosYoutube, songMetainfosLocal, songMetainfosSoundcloud) {

      return function (response, type) {
        switch (type) {
          case (songCommons.songType.local):
            return new songMetainfosLocal(response);
          case (songCommons.songType.songza):
            return new songMetainfosSongza(response);
          case (songCommons.songType.youtube):
            return new songMetainfosYoutube(response);
          case (songCommons.songType.soundcloud):
            return new songMetainfosSoundcloud(response);
        }
      }

    });
})();
