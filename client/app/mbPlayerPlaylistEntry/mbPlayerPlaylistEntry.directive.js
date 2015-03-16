'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerPlaylistEntry', function (angularPlayer) {
    return {
      templateUrl: 'app/mbPlayerPlaylistEntry/mbPlayerPlaylistEntry.html',
      restrict: 'EA',
      scope: {
        entry : '=entry'
      }, // scope will be inherited from parent scope
      link: function (scope, element, attrs) {
        scope.player = angularPlayer;
        scope.isEntryActive = function(entry) {
          return !_.isUndefined(angularPlayer.getCurrentSong()) && entry.id === angularPlayer.getCurrentSong().entryId;
        };
      }
    };
  });
