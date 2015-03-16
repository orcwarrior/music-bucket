/**
 * Created by orcwarrior on 2015-03-02.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songEngineYoutube', function (songControllsInterface, $log) {

      var songEngineYoutube = function (metainfos) {
        this.name = "songEngineYoutube";
        this.SM2Sound = createFromMetainfos(metainfos);

        this.buffer = function() {
          this.SM2Sound.load();
        };
        this.play = function play() {
          $log.info('song-engine-sm2: play song id: ' + this.SM2Sound.id );
          soundManager.play(this.SM2Sound.id);
          return this.SM2Sound.id;
        };
        this.stop = function stop() {
          soundManager.setPosition(this.SM2Sound.id, 0);
          soundManager.stopAll();
        };
        this.pause = function pause() {
          soundManager.pause(this.SM2Sound.id);
        };
        this.mute = function mute() {
          if (soundManager.muted === true) {
            soundManager.unmute()
          } else {
            soundManager.mute();
          }
        };
        this.setVolume = function setVolume(vol) {
          for (var i = 0; i < soundManager.soundIDs.length; i++) {
            var mySound = soundManager.getSoundById(soundManager.soundIDs[i]);
            mySound.setVolume(volume);
          }
        };
        this.seek = function seek(pos) {
          soundManager.setPosition(this.SM2Sound.id, 0);
        };
      }
      songEngineYoutube.prototype = new songControllsInterface();
      return songEngineYoutube;
    });
})();
