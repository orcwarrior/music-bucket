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
        getNext : function (playlistEntries) {
          // play next from last multiple-entry?
          if (!_.isNull(hlp.lastPlayedEntry)) {
            if ( hlp.playedCount < hlp.songsCount && !_.isUndefined(hlp.lastPlayedEntry.getNext))
              return hlp.lastPlayedEntry.getNext();
          }

          // get next entry:
          hlp.lastPlayedIdx = (_.isNull(hlp.lastPlayedIdx)) ? 0 : (++hlp.lastPlayedIdx % playlistEntries.length);
          return (hlp.lastPlayedEntry = playlistEntries[hlp.lastPlayedIdx]);
        }

    };
  })
})();
