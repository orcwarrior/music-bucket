'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerYoutubeControls', function (mbPlayerEngine, mbYoutubePlayer) {
    return {
      templateUrl: 'app/mbPlayerYoutubeControls/mbPlayerYoutubeControls.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        scope.ytApiReady = function() {
          return !_.isUndefined(window.onYouTubePlayerAPIReady);
        };
        scope.isCurrentlyPlaying = function(divId) {
          var song = mbPlayerEngine.getCurrentSong();
          if (_.isUndefined(song) || _.isNull(song)) return false;
          var element =  mbYoutubePlayer.getMyPlayerParentElement(song.metainfos.id);
          if (_.isNull(element) || _.isUndefined(element.id)) return false;
          return element.id == divId;
        };

        /* http://www.youtube.com/apiplayer?enablejsapi=1&version=3 */
        var ytPlayerConfig = {
          controls: 0, /* control elements hidden */
          modestbranding: 0, /* disables yt logo */
          disablekb: 1, /* disables keyboard shortcuts */
          enablejsapi: 1, /* js api enabled */
          fs: 0, /* fullscreen button visible */
          iv_load_policy: 3, /* annotations disabled by default */
          rel: 0, /* no related videos at the end */
          showinfo: 2, /* don't show info of video before playing */
          height: '390',
          width: '325'
        };
        function attachEvents(player) {
          player.addEventListener('onReady', function (event) { mbYoutubePlayer.onready(player, event); });

          player.addEventListener("onStateChange", function (event) { mbYoutubePlayer.onstatechange(player, event); });

          player.addEventListener("onError", function (event) { mbYoutubePlayer.onerror(player, event); });
        };

        // When youtube Player is Ready this method from window will be called
        window.onYouTubePlayerAPIReady = function (playerID) {
          console.log("onYouTubePlayerAPIReady");
          // players Init
          var player = new YT.Player('ytplayer1', {
            playerVars: ytPlayerConfig
          });
          attachEvents(player);

          var playerHelper = new YT.Player('ytplayer2', {
            playerVars: ytPlayerConfig
          });
          attachEvents(playerHelper);
          mbYoutubePlayer.addPlayer(playerHelper);
          mbYoutubePlayer.addPlayer(player);
        };
      }
    };
  });
