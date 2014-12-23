/**
 * Created by orcwarrior on 2014-12-05.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('queueEntry', function (SMSoundConverter) {
               return {
                 constructor: function (song, SMSound) {
                   this.song = song;
                   this.buffered = false;
                   this.SMSound = SMSound; // instance of soundmanager sound

                   this.buffer = function () {
                     if (this.buffered == true) return;

                     if (this.SMSound != null) {
                       this.SMSound.load();
                       this.buffered = true;
                     }
                     // get entry
                     else {
                       this.SMSound = SMSoundConverter.createAndBufferFromSong(this.song);
                       this.buffered = true;
                     }
                     return this.buffered;
                   }
                   this.play = function () {
                     if (this.SMSound == undefined) {
                       this.SMSound = SMSoundConverter.createAndBufferFromSong(this.song);
                     }
                       this.SMSound.play();
                   }
                   return this;
                 } // ctor
               } // return
             }
  );
})();
