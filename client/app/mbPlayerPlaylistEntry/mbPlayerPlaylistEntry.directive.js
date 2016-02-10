'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerPlaylistEntry', function (mbPlayerEngine) {
    return {
      templateUrl: 'app/mbPlayerPlaylistEntry/mbPlayerPlaylistEntry.html',
      restrict: 'EA',
      scope: {
        entry : '=entry'
      }, // scope will be inherited from parent scope
      link: function (scope, element, attrs) {
        scope.player = mbPlayerEngine;
        scope.isEntryActive = function(entry) {
          return !_.isUndefined(mbPlayerEngine.getCurrentSong()) && entry && entry.id === mbPlayerEngine.getCurrentSong().entryId;
        };
        scope.menuAction = function(action) {
          scope.actionsToggled = false;
          switch (action) {
            case "play":
              mbPlayerEngine.entryPlay(scope.entry);
              break;
            case "play-next":
              mbPlayerEngine.entryPlayNext(scope.entry);
              break;
            case "queue":
              mbPlayerEngine.entryEnqueue(scope.entry);
              break;
            case "remove":
              mbPlayerEngine.playlist.removeEntry(scope.entry.id);
              break;
          }
        };
      }
    };
  });
