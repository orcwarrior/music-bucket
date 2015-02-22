'use strict';

angular.module('musicBucketApp')
  .service('mbYoutubePlayer', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function

             /* http://www.youtube.com/apiplayer?enablejsapi=1&version=3 */
             var ytPlayerConfig = {
               controls: 0, /* control elements hidden */
               modestbranding: 0, /* disables yt logo */
               disablekb: 1, /* disables keyboard shortcuts */
               enablejsapi: 1, /* js api enabled */
               fs: 1, /* fullscreen button visible */
               iv_load_policy: 3, /* annotations disabled by default */
               rel: 0, /* no related videos at the end */
               showinfo: 0, /* don't show info of video before playing */

             }

             var youtubePlayer = {
               player : undefined,
             };

            // When youtube Player is Ready this method from window will be called
            window.onYouTubePlayerAPIReady = function() {
              alert('called onYouTubePlayerAPIReady');
              youtubePlayer.player = new YT.Player('divIDHere', {
                playerVars : ytPlayerConfig,
                events: {
                  "onStateChange": stopCycle
                }
              });
            }
  });
