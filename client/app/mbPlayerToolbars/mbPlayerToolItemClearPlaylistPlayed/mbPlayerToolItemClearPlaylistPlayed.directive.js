'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerToolItemClearPlaylistPlayed', function (mbPlayerEngine) {
    return {
      templateUrl: 'app/mbPlayerToolbars/mbPlayerToolItemClearPlaylistPlayed/mbPlayerToolItemClearPlaylistPlayed.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        scope.resetPlaylist = function () {
          var pl = mbPlayerEngine.getPlaylist();
          if (pl) pl.resetPlayedSongs();
        };
      }
    };
  });
