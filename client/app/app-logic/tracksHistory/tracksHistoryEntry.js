/**
 * Created by orcwarrior on 2015-02-25.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('tracksHistoryEntry', function (SMSoundConverter, $log) {
      return {
        constructor: function (song, SMSound) {
          this.song = song;
          this.buffered = false;
          this.SMSound = SMSound; // instance of soundmanager sound

          this.buffer = function () {
            if (!_.isUndefined(this.song))
              $log.info('tracksHistoryEntry: buffer on: ' + this.song.shared.id + ' - ' + this.song.shared.getSongDescription() + ' called.');
            //if (this.buffered == true) return;

            if (this.SMSound != null) {
              $log.info('tracksHistoryEntry: ..already has SMSound, buffer it!');
              this.SMSound.load();
              this.buffered = true;
            }
            // get entry
            else {
              $log.info('tracksHistoryEntry: ..create and buffer SMSound!');
              this.SMSound = SMSoundConverter.createAndBufferFromSong(this.song);
              this.buffered = true;
            }
            return this.buffered;
          }
          this.play = function () {
            $log.info('tracksHistoryEntry: play on: '+this.song.shared.id + ' - ' + this.song.shared.getSongDescription() + ' called.');
            if (this.SMSound == undefined) {
              $log.info('tracksHistoryEntry: play: song has to be created and buffered.');
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
