'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerToolItemClearPlaylist', function (mbPlayerEngine) {
    return {
      templateUrl: 'app/mbPlayerToolbars/mbPlayerToolItemClearPlaylist/mbPlayerToolItemClearPlaylist.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        scope.getPlaylist = function () {
          return mbPlayerEngine.getPlaylist();
        };
        scope.clearPlaylist = function () {
          mbPlayerEngine.clearPlaylist();
        };
      }
    };
  });
