'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerList', function (mbPlayerListManager, playlistListProvider, mbPlayerEngine) {
    return {
      templateUrl: 'app/mbPlayerList/mbPlayerList.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        scope.manager = mbPlayerListManager;
        scope.manager.registerSwapperElement(element.find('.player-list-swapper'));
        scope.manager.registerListScope(scope);
        var scrollInited = false;
        scope.initPlaylistScroll = function () {
          if (!scrollInited) {
            scope.$broadcast('list-scroll:update', null);
            scrollInited = true;
          }
          scope.playlistScroll = true;
        }
        // bugfix:
        scope.$on('playlist:update', function() {
          var playlist = new playlistListProvider(mbPlayerEngine.getPlaylist());
          mbPlayerListManager.swapLists(undefined, playlist);
        });
      }
    };
  });
