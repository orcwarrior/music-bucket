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
          return !_.isUndefined(mbPlayerEngine.getCurrentSong()) && entry.id === mbPlayerEngine.getCurrentSong().entryId;
        };
        scope.menuAction = function(actionCb) {
          scope.actionsToggled = false;
          actionCb();
        };
      }
    };
  });
