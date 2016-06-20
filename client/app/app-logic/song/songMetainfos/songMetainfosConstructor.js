/**
 * Created by orcwarrior on 2015-03-02.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songMetainfosConstructor', function (songCommons, songMetainfosSongza, songMetainfosMediaItem, songMetainfosYoutube,
                                                   songMetainfosLocal, songMetainfos, songMetainfosSoundcloud) {

      return function (response, type) {
        if (type === songCommons.songType.mediaItem || (response && response.__forceMediaItemMetainfos))
          return new songMetainfosMediaItem(response);

        switch (type) {
          case (songCommons.songType.local):
            return new songMetainfosLocal(response);
          case (songCommons.songType.songza):
            return new songMetainfosSongza(response);
          case (songCommons.songType.youtube):
            return new songMetainfosYoutube(response);
          case (songCommons.songType.soundcloud):
            return new songMetainfosSoundcloud(response);
          case (songCommons.songType.unresolved):
            return new songMetainfos(response);
        }
      }

    });
})();
