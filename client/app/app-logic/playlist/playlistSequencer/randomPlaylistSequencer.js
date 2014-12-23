/**
 * Created by orcwarrior on 2014-12-19.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('randomPlaylistSequencer', function () {
               var hlp = {
                 lastPlayedEntry : null,
                 lastPlayedIdx : null
               };
                 function fillEntriesRanges(entries) {
                    var result = [0];

                   for (var i = 0; i < entries.length; ++i) {
                     result.push((entries[i].songsCount - entries[i].playedCount) + _.last(result));
                   }
                   result.shift();
                   return result;
                 };
               return {
                 iconClass : 'icon-shuffle',
                 getNext : function (playlistEntries, entriesCount) {
                   // random next entry (balanced):
                   var entriesRanges = fillEntriesRanges(playlistEntries);
                   var rndEntry = _.last(entriesRanges) * Math.random();
                   for (var idx=0; idx < entriesRanges.length; idx++) {
                     if(entriesRanges[idx] < rndEntry && (idx+1 < entriesRanges.length && entriesRanges[idx+1] >= rndEntry))
                     {
                       // get next entry:
                       hlp.lastPlayedIdx = idx+1;
                       hlp.lastPlayedEntry = playlistEntries[hlp.lastPlayedIdx];
                       return hlp.lastPlayedEntry.getNext()
                         .then( function(song) {
                                  return song;
                                });

                     }
                   }
                 }

               };
             })
})();
