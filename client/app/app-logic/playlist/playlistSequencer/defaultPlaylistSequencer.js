/**
 * Created by orcwarrior on 2014-11-24.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('defaultPlaylistSequencer', function () {
          var hlp = {
              lastPlayedEntry : null,
              lastPlayedIdx : null
          };
      return {
        iconClass : 'icon-loop',
        getNext : function (playlistEntries) {
          // play next from last multiple-entry?
          // if (!_.isNull(hlp.lastPlayedEntry)) {
          //   if ( hlp.lastPlayedEntry.playedCount < hlp.lastPlayedEntry.songsCount && !_.isUndefined(hlp.lastPlayedEntry.getNext))
          //     return hlp.lastPlayedEntry.getNext();
          // }

          // get next entry:
          hlp.lastPlayedIdx = (_.isNull(hlp.lastPlayedIdx)) ? 0 : (++hlp.lastPlayedIdx % playlistEntries.length);
          hlp.lastPlayedEntry = playlistEntries[hlp.lastPlayedIdx];
          return hlp.lastPlayedEntry.getNext();
          // .then( function(song) {
          //          return song;
          //        });
        }

    };
  })
})();
