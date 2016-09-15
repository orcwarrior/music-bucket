'use strict';

angular.module('musicBucketApp')
  .directive('mediaCollectionPaginationTile', function () {
    return {
      templateUrl: 'app/mediaCollectionPaginationTile/mediaCollectionPaginationTile.html',
      restrict: 'EA',
      scope: {
        pageObject : "=pageObject"
      },
      link: function (scope, element, attrs) {
      }
    };
  });
