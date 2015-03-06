/**
 * Created by orcwarrior on 2015-01-17.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('songDBFactory', function () {

      // IT's unused !!!
      return {
        convertFrom: function (songDb) {
        },
        convertTo: function (song) {
          var songDB = {
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
            songDB.metainfos.albumArt = song.metainfos.albumArt;
          }
          return songDB;
        }
      };
    });
})();
