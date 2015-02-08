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
        element.css({
          padding: '7px 10px'
                    });
        scope.player = angularPlayer;
      }
    };
  });
