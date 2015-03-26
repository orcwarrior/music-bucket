/**
 * Created by orcwarrior on 2015-03-02.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songEngineYoutube', function (songControllsInterface, mbYoutubePlayer, $log) {

      var songEngineYoutube = function (metainfos) {
        this.name = "songEngineYoutube";
        var videoId = this.videoId = metainfos.id;
        function buildReturn(res) {
          res = {result: res};
          return res;
        }
        function updateMetainfosOnBuffered(event) {
          var videoInfos = mbYoutubePlayer.getInfos(videoId);
          metainfos.title = videoInfos.title || videoInfos;
        };
        this.isBuffered = function () {
          return mbYoutubePlayer.isBuffered(this.videoId);
        };
        this.buffer = function () {
          return mbYoutubePlayer.buffer(this.videoId, updateMetainfosOnBuffered);
        };
        this.play = function play() {
          return mbYoutubePlayer.play(this.videoId);
        };
        this.stop = function stop() {
          return mbYoutubePlayer.stop(this.videoId);
        };
        this.pause = function pause() {
          return mbYoutubePlayer.pause(this.videoId);
        };
        this.mute = function mute() {
          return mbYoutubePlayer.mute(this.videoId);
        };
        this.setVolume = function setVolume(vol) {
          return mbYoutubePlayer.setVolume(this.videoId, vol * 100);
        };
        this.seek = function seek(pos) {
          return mbYoutubePlayer.seek(this.videoId, pos);
        };
        this.getDuration = function getDuration() {
          return mbYoutubePlayer.getDuration(this.videoId);
        };
        this.getLoadedProgress = function getLoadedProgress() {
          return [mbYoutubePlayer.getLoadedProgress(this.videoId)];
        };
        this.getCurrentPosition = function getCurrentPosition() {
          return [mbYoutubePlayer.getCurrentPosition(this.videoId) / this._getDuration(), mbYoutubePlayer.getCurrentPosition(this.videoId), this._getDuration()];
        };

        // Wrap methods with function error-checking function:
        function wrapMethodsInErrHander(engine) {
          _.each(engine, function (val, key) {
            if (_.isFunction(val)) {
              engine["_" + key] = engine[key]; // <- do copy of unwarped method.
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
          // TODO: Error handling (?)
        }
      };
      songEngineYoutube.prototype = new songControllsInterface();
      return songEngineYoutube;
    });
})();
