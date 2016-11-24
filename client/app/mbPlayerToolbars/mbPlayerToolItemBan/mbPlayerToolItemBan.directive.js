'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerToolItemBan', function (mbPlayerEngine) {
    return {
      templateUrl: 'app/mbPlayerToolbars/mbPlayerToolItemBan/mbPlayerToolItemBan.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        scope.banSong = function () {
          var pl = mbPlayerEngine.getPlaylist();
          var song = mbPlayerEngine.getCurrentSong();
          pl.banSong(song);
          mbPlayerEngine.nextTrack(false)
        };
      }
    };
  });
