/**
 * Created by orcwarrior on 2014-12-26.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('entryCommons', function () {
      return {
        nextOrder: {sequence: 'eOrderSeq', random: 'eOrderRand'},
        entryType: {
          local: "eLocal",
          songzaPlaylist: "eSongzaPlaylist",
          youtubeVideo: "eYoutubeVideo",
          youtubePlaylist: "eYoutubePlaylist",
          soundcloudTrack: 'eSoundcloudTrack',
          virtalPlaylist: "eVirtual" /*...*/
        }
      }
    });
})();
