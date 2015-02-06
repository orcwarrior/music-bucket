/**
 * Created by orcwarrior on 2014-12-05.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('queueEntry', function (SMSoundConverter, $log) {
               return {
                 constructor: function (song, SMSound) {
                   this.song = song;
                   this.buffered = false;
                   this.SMSound = SMSound; // instance of soundmanager sound

                   this.buffer = function () {
                     if (!_.isUndefined(this.song))
                      $log.info('queueEntry: buffer on: ' + this.song.shared.id + ' - ' + this.song.shared.getSongDescription() + ' called.');
                     //if (this.buffered == true) return;

                     if (this.SMSound != null) {
                       $log.info('queueEntry: ..already has SMSound, buffer it!');
                       this.SMSound.load();
                       this.buffered = true;
                     }
                     // get entry
                     else {
                       $log.info('queueEntry: ..create and buffer SMSound!');
                       this.SMSound = SMSoundConverter.createAndBufferFromSong(this.song);
                       this.buffered = true;
                     }
                     return this.buffered;
                   }
                   this.play = function () {
                     $log.info('queueEntry: play on: '+this.song.shared.id + ' - ' + this.song.shared.getSongDescription() + ' called.');
                     if (this.SMSound == undefined) {
                       $log.info('queueEntry: play: song has to be created and buffered.');
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
