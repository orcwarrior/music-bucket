'use strict';

angular.module('musicBucketApp')
  .directive('spotifyCategoryTile', function ($state) {
    return {
      templateUrl: 'app/routes/spotify/directives/spotifyCategoryTile/spotifyCategoryTile.html',
      restrict: 'EA',
      scope: {'category': '=category'},
      link: function (scope, element, attrs) {
        scope.openCategory = function () {
          if (scope.$parent.openCategory) return scope.$parent.openCategory(scope.category);

          $state.go('.', {categoryId: scope.category.id}, {notify: true});
        }
      }
    };
  });
