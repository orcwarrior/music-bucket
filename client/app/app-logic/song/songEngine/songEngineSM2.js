/**
 * Created by orcwarrior on 2015-03-02.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songEngineSM2', function (songControllsInterface, $log) {

      /* private methods */
      function createFromMetainfos(metainfos, self) {
        //check if mime is playable first: -dk
        if (!soundManager.canPlayMIME(metainfos.type) || _.isUndefined(metainfos.type)) {
          //check if url is playable
          if (soundManager.canPlayURL(metainfos.getUrl()) !== true) {
            console.log('invalid song url');
            return null;
          }
        }
        return soundManager.createSound({
          id: metainfos.id,
          url: metainfos.getUrl(),
          /* events cb */
          onload: _.bind(function (e) {
            if (_.isFunction(this.onload)) this.onload(e);
          }, self)
        });

      };


      var songEngineSM2 = function (metainfos) {

        var sm2SoundVar = this.SM2Sound = createFromMetainfos(metainfos, this);

        function buildReturn(res) {
          res = {result: res};
          if (_.isNull(sm2SoundVar)) {
            res.error = true;
          }
          return res;
        }

        this.isBuffered = function () {
          return buildReturn(true);
        };
        this.buffer = function () {
          if (buildReturn().error) return buildReturn();

          this.SM2Sound.load();
          return buildReturn(this.SM2Sound.id);
        };
        this.play = function play() {
          if (buildReturn().error) return buildReturn();

          $log.info('song-engine-sm2: play song id: ' + this.SM2Sound.id);
          soundManager.play(this.SM2Sound.id);
          return buildReturn(this.SM2Sound.id);
        };
        this.stop = function stop() {
          if (buildReturn().error) return buildReturn();

          // soundManager.setPosition(this.SM2Sound.id, 0);
          soundManager.stopAll();
          return buildReturn(this.SM2Sound.id);
        };
        this.pause = function pause() {
          if (buildReturn().error) return buildReturn();

          soundManager.pause(this.SM2Sound.id);
          return buildReturn(this.SM2Sound.id);
        };
        this.mute = function mute() {
          if (buildReturn().error) return buildReturn();

          if (soundManager.muted === true) {
            soundManager.unmute();
          } else {
            soundManager.mute();
          }
          return buildReturn(this.SM2Sound.id);
        };
        this.setVolume = function setVolume(vol) {
          if (buildReturn().error) return buildReturn();

          for (var i = 0; i < soundManager.soundIDs.length; i++) {
            var mySound = soundManager.getSoundById(soundManager.soundIDs[i]);
            mySound.setVolume(vol);
          }
          return buildReturn(this.SM2Sound.id);
        };
        this.seek = function seek(pos) {
          if (buildReturn().error) return buildReturn();

          soundManager.setPosition(this.SM2Sound.id, pos);
          return buildReturn(this.SM2Sound.id);
        };
        this.getDuration = function getDuration() {
          if (buildReturn().error) return buildReturn();

          return buildReturn(this.SM2Sound.durationEstimate);
        };

        // Events callbacks:
        /**
         *
         * @param callbackFn passed function to be called back onload.
         */
        // this.onload = function (callbackFn) {
        //   alert("SM2Sound load alert!");
        //   return buildReturn(this.SM2Sound.id);
        // }

      };
      songEngineSM2.prototype = new songControllsInterface();
      return songEngineSM2;
    });
})();
