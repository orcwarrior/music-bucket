'use strict';

angular.module('musicBucketApp')
  .service('mbPlayerEngine', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function

    return {
      playlist : null,
      queue    : null,
      /* ... */
      /* basic controlls */
      playSong :            function(song)    {},
      play :                function()        {},
      pause :               function()        {},
      stop :                function()        {},
      nextTrack :           function()        {},
      prevTrack :           function()        {},
      mute :                function()        {},
      setVolume :           function(vol)     {},
      setPosition :         function(pos)     {},
      /* playlist */
      setPlaylist :         function(playlist){},
      getPlaylist :         function()        {},
      addToPlaylist :       function(entry)   {},
      /* queue */
      pushNextSongToQueue : function(onLoadCb){},
      /* track/song */
      /* events */
      onSongBufferUpdate :  function(part)    {},
      onSongEnd :           function()        {},
    };
  });
