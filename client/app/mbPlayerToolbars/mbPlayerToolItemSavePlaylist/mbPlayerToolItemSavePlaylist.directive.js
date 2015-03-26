'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerToolItemSavePlaylist', function (mbPlayerEngine, playlistService) {
    return {
      templateUrl: 'app/mbPlayerToolbars/mbPlayerToolItemSavePlaylist/mbPlayerToolItemSavePlaylist.html',
      restrict: 'EA',
        link: function (scope, element, attrs) {
          scope.player = mbPlayerEngine;
        scope.savePlaylist = function () {
          if (!_.isUndefined(mbPlayerEngine.getPlaylist())) {
            playlistService.save(mbPlayerEngine.getPlaylist());
          }
        };
      }
    };
  });
