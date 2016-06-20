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
        // bugfix:
        scope.$on('playlist:update', function (event, playlist) {
          if (!(scope.manager.activeList instanceof playlistListProvider)) return;
          scope.manager.activeList.container.entryRef = playlist;
          scope.manager.activeList.container.entries = playlist.entries;
          scope.manager.activeList.container.entriesVals = _.values(playlist.entries);
        });
      }
    };
  });
