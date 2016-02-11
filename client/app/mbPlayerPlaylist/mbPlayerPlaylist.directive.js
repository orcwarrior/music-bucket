'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerPlaylist', function ($document, $window, mbPlayerEngine) {
    return {
      templateUrl: 'app/mbPlayerPlaylist/mbPlayerPlaylist.html',
      restrict: 'EA',
      scope: {
        playlist: '=playlist'
      },
      link: function (scope, element, attrs) {
        var NAVBAR_HEIGHT = 60;
        var TOOLBAR_HEIGHT = 0;       // TODO: In toolbarService store some toolbarHeight value
        var MAINCONTROLL_HEIGHT = 360; // TODO: From where playerMainControlls Height should be taken???
        scope.player = mbPlayerEngine;

        scope.isEntrySelected = function(entry) {
          return scope.player.selectedDetailsEntry === entry;
        };
      } // link
    };
  });
