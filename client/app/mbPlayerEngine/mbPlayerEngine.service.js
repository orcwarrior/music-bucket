'use strict';

angular.module('musicBucketApp')
  .service('mbPlayerEngine', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function

    return {
      playlist : null,
      queue    : null,
      /* ... */
      playSong :    function()    {},
      play :        function()    {},
      pause :       function()    {},
      stop :        function()    {},
      nextTrack :   function()    {},
      prevTrack :   function()    {},
      mute :        function()    {},
      setVolume :   function()    {},
      setPosition : function()    {},
    };
  });
