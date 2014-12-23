/**
 * Created by orcwarrior on 2014-12-16.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('localEntry', function ($rootScope, $q, songLocal, SMSoundConverter) {
               return {
                 constructor: function (localSong) {
                   var self = this;
                   this.songsCount = 1;
                   this.playedCount = 0;
                   this.entry = localSong;
                   this.id = this.entry.shared.id;
                   // Temporary, pre warm-up name:
                   this.shortDescription = this.entry.shared.title;

                   this.init = function () {
                     var entry = this.entry;
                     var file = this.entry.base.file;
                     setTimeout(function() {
                       ID3.loadTags(file.name, function() {
                         var tags;
                         setTimeout(function () {
                           tags = ID3.getAllTags(file.name);
                           setTimeout(function() {
                             entry.shared.id3 = tags;
                             entry.shared.id3ToShared();
                             self.updateShortDescription();
                           }, 0);
                         },50);
                       }, {dataReader: FileAPIReader(file)})
                     }, 0);

                     this.SMSound = SMSoundConverter.createFromSong(this.entry);
                   }
                   this.init();
                   this.getNext = function () {
                     var deferred = $q.defer();
                     this.playedCount++;
                     deferred.resolve(this.entry);
                     return deferred.promise;
                   }
                   this.updateShortDescription = function() {
                     this.shortDescription = this.entry.shared.artist + " - " + this.entry.shared.title;
                   }
                   return this;
                 }
               };
             });
}
)();
