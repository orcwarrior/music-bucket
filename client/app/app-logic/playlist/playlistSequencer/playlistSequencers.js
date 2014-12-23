/**
 * Created by orcwarrior on 2014-11-24.
 */
/**
 * Created by orcwarrior on 2014-11-24.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('playlistSequencers', function (defaultPlaylistSequencer, randomPlaylistSequencer) {
                 return { 'default' : defaultPlaylistSequencer,
                          'random' : randomPlaylistSequencer,
                           toArray : function() { return [defaultPlaylistSequencer, randomPlaylistSequencer];}
                 };
})
})();
