/**
 * Created by orcwarrior on 2015-03-02.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songEngineSM2', function (songControllsInterface, $log) {

      /* private methods */
      /* Note: Methods with "_" prefix are unwraped ones. */
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
        this.name = "songEngineSM2";
        var sm2SoundVar = this.SM2Sound = createFromMetainfos(metainfos, this);

        function buildReturn(res) {
          res = {result: res};
          if (_.isNull(sm2SoundVar)) {
            res.error = true;
          }
          return res;
        }

        this.__isBuffered = false;
        this.isBuffered = function () {
          // TODO: Implement
          return this.__isBuffered;
        };
        this.buffer = function () {
          this.SM2Sound.load();
        };
        this.play = function play() {
          $log.info('song-engine-sm2: play song id: ' + this.SM2Sound.id);
          soundManager.play(this.SM2Sound.id);
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
            soundManager.unmute();
          } else {
            soundManager.mute();
          }
        };
        this.setVolume = function setVolume(vol) {
          for (var i = 0; i < soundManager.soundIDs.length; i++) {
            var mySound = soundManager.getSoundById(soundManager.soundIDs[i]);
            mySound.setVolume(vol);
          }
        };
        this.seek = function seek(pos) {
          soundManager.setPosition(this.SM2Sound.id, pos);
        };
        this.getDuration = function getDuration() {
          return this.SM2Sound.durationEstimate;
        };
        this.getLoadedProgress = function getLoadedProgress() {
          return [this.SM2Sound.bytesLoaded / this.SM2Sound.bytesTotal, this.SM2Sound.bytesLoaded, this.SM2Sound.bytesTotal];
        };
        this.getCurrentPosition = function getCurrentPosition() {
          return [this.SM2Sound.position / this._getDuration(), this.SM2Sound.position, this.getDuration()];
        };

        // Wrap methods with function error-checking function:
        function wrapMethodsInErrHander(engine) {
          _.each(engine, function (val, key) {
            if (_.isFunction(val)) {
              engine["_"+key] = engine[key]; // <- do copy of unwarped method.
              engine[key] = _.wrap(engine[key],
              function (func, args) {
                  if (buildReturn().error)
                    return buildReturn();
                  else if (_.isUndefined(args) || _.isNull(args))
                    return buildReturn(_.bind(func, engine)());
                  else
                    return buildReturn(_.bind(func, engine, args[0], args[1], args[2], args[3], args[4])());
                });
            }
          });
        }
        wrapMethodsInErrHander(this);


        // Events callbacks:
        /**
         *
         * @param callbackFn passed function to be called back onload.
         */
        this.onload = function (loadedOk) {
          if (!loadedOk) {
            // Re-load sound again: (after delay)
            _.delay(_.bind(function reload() {
              this.buffer();
            }, this), 500);
          }
          if (!this._isBuffered()) {
            this.fireEvent("onsongready", loadedOk);
            this.__isBuffered = true;
          }
          console.log("SM2Sound load alert!");
          return buildReturn(this.SM2Sound.id);
        }

      };

      songEngineSM2.prototype = new songControllsInterface();
      return songEngineSM2;
    });
})();
