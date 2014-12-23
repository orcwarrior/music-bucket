/**
 * Created by orcwarrior on 2014-11-11.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('playlist', function (playlistSequencers, playlistService) {
                 function rewriteBase(base) {
                   if (!_.isUndefined(base)) {
                     this.entries = base.entries;
                     this.songsCount = base.entriesCount;

                   }
                 }
               return {
                 constructor: function (base) {
                   var self = this;
                   this.name = '';
                   this.entries = [];
                   this.songsCount = 0; // count of all songs
                   rewriteBase(base);

                   this.playlistSequencer = playlistSequencers['default'];
                   this.nextPlaylistSequencer = function() {
                     var playlistSequencersArr = playlistSequencers.toArray();
                     var thisIdx = playlistSequencersArr.indexOf(this.playlistSequencer);
                     var nextIdx = ++thisIdx % playlistSequencersArr.length;
                     this.playlistSequencer = playlistSequencersArr[nextIdx];
                   }

                   // methods:
                   this.getNext = function () {
                     return this.playlistSequencer.getNext(this.entries, this.songsCount); /* an promise*/
                   }
                   this.addEntry = function (entry) {
                     this.isAltered = true;
                     if (_.isUndefined(entry.songsCount))
                       this.songsCount++;
                     else
                       this.songsCount += entry.songsCount;
                     this.entries.push(entry);
                   }
                   this.removeEntry = function (entryId) {
                     this.isAltered = true;
                     this.entries =  _.reject(this.entries, function(entry){
                       return entry.id == entryId;
                     });
                   }

                   this.isAltered = false;
                   this.savePlaylist = function() {
                     if (this.name === '') this.settingPlaylistName = true;

                      if (this.settingPlaylistName) {
                        if (this.name === '') return;
                        else
                          this.settingPlaylistName = false;
                      }

                     playlistService.save(this)
                       .then(function(response){
                         this.id = response.id;
                         this.isAltered = false;
                       }).bind(this);
                   }
                   return this;
                 }
               };
             });
}
)();
