/**
 * Created by orcwarrior on 2014-11-11.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('playlist', function (playlistLocalStorage, playlistSequencers, playlistCookieFactory, Auth) {

                 function rewriteBase(base) {
                   if (!_.isUndefined(base)) {
                     this.entries = base.entries;
                     this.songsCount = base.entriesCount;
                   }
                 }
                 function putSongToSampler(playlist, song) {
                      if(song.shared.albumArt && !song.shared.albumArtAttached && playlist.sampleSongs.length < 5) {
                        playlist.sampleSongs.push({src: song.shared.albumArt, description: song.shared.getSongDescription()});
                      };
                 }
               return {
                 constructor: function (base) {
                   var self = this;

                   this.name = '';
                   this.entries = [];
                   this.songsCount = 0; // count of all songs

                   this.playlistSequencer = playlistSequencers['default'];
                   this.nextPlaylistSequencer = function() {
                     var playlistSequencersArr = playlistSequencers.toArray();
                     var thisIdx = playlistSequencersArr.indexOf(this.playlistSequencer);
                     var nextIdx = ++thisIdx % playlistSequencersArr.length;
                     this.playlistSequencer = playlistSequencersArr[nextIdx];
                   }

                   this.sampleSongs = [];
                   this.isAltered = false;

                   _.extend(this, playlistLocalStorage);
                   _.extend(this, base);

                   // methods:
                   this.getNext = function () {
                     return this.playlistSequencer.getNext(this.entries, this.songsCount, this.getNextCallback); /* an promise*/
                   }
                   this.getNextCallback = function(song){
                     putSongToSampler(self, song);
                   }
                   this.addEntry = function (entry) {
                     this.alter();
                     if (_.isUndefined(entry.songsCount))
                       this.songsCount++;
                     else
                       this.songsCount += entry.songsCount;
                     this.entries.push(entry);
                   }
                   this.removeEntry = function (entryId) {
                     this.alter();
                     this.entries =  _.reject(this.entries, function(entry){
                       return entry.id == entryId;
                     });
                   }

                   this.alter = function() {
                     this.isAltered = true;
                     this.storeInLocalstorage();
                   }
                   this.toCookieModel = function() {
                     var result = {
                       name : this.name,
                       songsCount : this.songsCount,
                       entries : _.map(this.entries, function(entry) { return entry.toCookieModel();}),
                       sampleSongs : this.sampleSongs,
                       playlistSequencer : this.playlistSequencer
                     }

                     return result;
                   }
                   return this;
                 } //eof constructor
               };
             })
    .factory('playlistFuncs', function() {


               });
}
)();
