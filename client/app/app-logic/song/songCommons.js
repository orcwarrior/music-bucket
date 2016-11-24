/**
 * Created by orcwarrior on 2014-11-08.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songCommons', function () {
      return {
        songType: {
          songza: "typeSongza",
          local: "typeLocal",
          spotify: "typeSpotify",
          youtube: "typeYoutube",
          soundcloud: "typeSoundcloud",
          mediaItem: "typeMediaItem",
          unresolved: "typeUnresolved"
        },
        songState: {
          normal: "sNormal",
          deleted: "sDeleted",
          banned: "sBanned"
        }
      };
    });
})();
