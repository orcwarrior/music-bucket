/**
 * Created by orcwarrior on 2015-01-17.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('songCookieFactory', function (song, songCommons) {

      return {
        convertFrom: function (songCookie) {
          songCookie.metainfos.metainfosAsResponse = true;
          songCookie.metainfos.getUrl = function () { return this.url;};
          var result = new song(songCookie.metainfos, songCookie.type);
          return result;
        },
        convertTo: function (song) {
          var songCookie = {
            metainfos: {
              id: song.metainfos.id,
              url: song.metainfos.url,
              artist: song.metainfos.artist,
              title: song.metainfos.title,
              album: song.metainfos.album,
              genere: song.metainfos.genere
            },
            type: song.type
          };

          // Copy album art only if it's an URL.
          if (!song.metainfos.albumArtAttached) {
            songCookie.metainfos.albumArt = song.metainfos.albumArt;
          }
          return songCookie;
        }
      }
    });
})();
