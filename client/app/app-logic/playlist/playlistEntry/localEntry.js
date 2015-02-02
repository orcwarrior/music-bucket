/**
 * Created by orcwarrior on 2014-12-16.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('localEntry', function ($rootScope, $q, entryCommons, songLocal, songYoutube, SMSoundConverter, youtubeApiHelper) {
               function commonInit(self) {
                 self.type = entryCommons.entryType.localEntry;
                 self.songsCount = 1;
                 self.playedCount = 0;

                 self.init = function () {
                   var entry = this.entries[0];
                   var file = entry.base.file;
                   setTimeout(function () {
                     ID3.loadTags(file.name, function () {
                       var tags;
                       setTimeout(function () {
                         tags = ID3.getAllTags(file.name);
                         setTimeout(function () {
                           entry.shared.id3 = tags;
                           entry.shared.id3ToShared();
                           self.updateShortDescription();
                           youtubeApiHelper.search.go(entry.shared.getSongDescription())
                             .then(function (response) {
                                     var ytEquivalent = youtubeApiHelper.searchExtractBestMatch(response, entry.shared);
                                     entry.ytSongLink = new songYoutube.constructor(ytEquivalent, entry);
                                   });
                         }, 0);
                       }, 50);
                     }, {dataReader: FileAPIReader(file)})
                   }, 0);

                   this.SMSound = SMSoundConverter.createFromSong(entry);
                 }
                 self.getNext = function (playlistCallback) {
                   var deferred = $q.defer();
                   // TODO: Move to player (on-play, store reference to currenty playlist-entry)
                   this.playedCount++;
                   deferred.resolve(this.entries[0]);
                   playlistCallback(this.entries[0]);
                   return deferred.promise;
                 }
                 self.updateShortDescription = function () {
                   this.shortDescription = this.entries[0].shared.artist + " - " + this.entries[0].shared.title;
                 }
                 self.getPlaylistDescription = function() {
                   self.updateShortDescription();
                   return this.shortDescription;
                 }
               } // commonInit

               return {
                 constructor_: function () {
                   commonInit(this);
                 },
                 constructor  : function (localSong) {
                   var self = this;
                   commonInit(this);
                   this.entries = [localSong];
                   this.id = this.entries[0].shared.id;
                   // Temporary, pre warm-up name:
                   this.shortDescription = this.entries[0].shared.title;
                   this.init();
                 }
               };
             });
}
)();
