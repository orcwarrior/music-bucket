/**
 * Created by orcwarrior on 2015-02-26.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('songControllsInterface', function () {

      var songControllsInterface = function (protoFunction) {
        if (_.isUndefined(protoFunction))
          protoFunction = function () { console.warn("songControlls: interface method called, it shouldn't happen!!!"); }

        /* It's quite ugly but there is no other way
        * to do it. */
        this.play = function play() {
          var args = rewriteArgs(arguments);
          args[args.length] = "play";
          return protoFunction.apply(this, args);
        };
        this.stop = function stop() {
          var args = rewriteArgs(arguments);
          args[args.length] = "stop";
          return protoFunction.apply(this, args);
        };
        this.pause = function pause() {
          var args = rewriteArgs(arguments);
          args[args.length] = "pause";
          return protoFunction.apply(this, args);
        };
        this.mute = function mute() {
          var args = rewriteArgs(arguments);
          args[args.length] = "mute";
          return protoFunction.apply(this, args);
        };
        this.setVolume = function setVolume(vol) {
          var args = rewriteArgs(arguments);
          args[args.length] = "setVolume";
          return protoFunction.apply(this, args);
        };
        this.seek = function seek(pos) {
          var args = rewriteArgs(arguments);
          args[args.length] = "seek";
          return protoFunction.apply(this, args);
        };
        this.isBuffered = function isBuffered() {
          var args = rewriteArgs(arguments);
          args[args.length] = "buffer";
          return protoFunction.apply(this, args);
        };
        this.buffer = function buffer() {
          var args = rewriteArgs(arguments);
          args[args.length] = "buffer";
          return protoFunction.apply(this, args);
        };
      }
      function rewriteArgs(args) {
        var res = [];
        for (var i=0; i < args.length; i++) {
          res[i] = args[i];
        }
        return res;
      }

      return songControllsInterface;
    });
})();
