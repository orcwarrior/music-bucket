'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerToolItemPlayOrder', function (angularPlayer) {
    return {
      templateUrl: 'app/mbPlayerToolbars/mbPlayerToolItemPlayOrder/mbPlayerToolItemPlayOrder.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        scope.getPlaylist = function () {
          return angularPlayer.getPlaylist();
        };
      }
    };
  });
