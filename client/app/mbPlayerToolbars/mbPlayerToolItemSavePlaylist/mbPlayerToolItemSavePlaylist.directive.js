'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerToolItemSavePlaylist', function (angularPlayer, playlistService) {
    return {
      templateUrl: 'app/mbPlayerToolbars/mbPlayerToolItemSavePlaylist/mbPlayerToolItemSavePlaylist.html',
      restrict: 'EA',
        link: function (scope, element, attrs) {
          scope.player = angularPlayer;
        scope.savePlaylist = function () {
          if (!_.isUndefined(angularPlayer.getPlaylist())) {
            playlistService.save(angularPlayer.getPlaylist());
          }
        };
      }
    };
  });
