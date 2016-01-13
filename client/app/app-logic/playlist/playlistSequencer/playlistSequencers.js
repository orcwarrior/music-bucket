/**
 * Created by orcwarrior on 2014-11-24.
 */
/**
 * Created by orcwarrior on 2014-11-24.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('playlistSequencers', function (defaultPlaylistSequencer, randomPlaylistSequencer, repeatOnePlaylistSequencer) {
                 return { 'default' : defaultPlaylistSequencer,
                          'random' : randomPlaylistSequencer,
                          'repeatOne' : repeatOnePlaylistSequencer,
                           toArray : function() { return [defaultPlaylistSequencer, randomPlaylistSequencer, repeatOnePlaylistSequencer];}
                 };
})
})();
