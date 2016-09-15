'use strict';

angular.module('musicBucketApp')
  .directive('mediaCollection', function ($window) {
    return {
      templateUrl: 'app/mediaCollection/mediaCollection.html',
      restrict: 'EA',
      scope: {
        collection: "=collection"
      },
      link: function (scope, element, attrs) {
        var CONTAINER_PADDINGS = 30;

        function getMediaItemTileWidth() {
          if ($window.innerWidth < 768) // $screen-xs-max
            return 154;
          else return 195;
        }

        var LINES_PER_COLLECTION = 2;
        scope.$watch(
          function () {
            return element[0].offsetWidth;
          },
          function (value) {
            if (!scope.collection || (scope.collection._ui && scope.collection._ui.collapsed)) return;

            var tilesPerLine = Math.floor((value - CONTAINER_PADDINGS) / getMediaItemTileWidth());
            scope.collection.pageObject.setOneLineSize(tilesPerLine);
          });
        scope.toggleCollection = function () {
          if (!scope.collection._ui) scope.collection._ui = {};
          scope.collection._ui.collapsed = !scope.collection._ui.collapsed;
        }
      }
    };
  });
