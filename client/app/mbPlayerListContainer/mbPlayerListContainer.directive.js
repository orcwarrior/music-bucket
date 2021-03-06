'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerListContainer', function ($rootScope, $timeout) {
    return {
      templateUrl: 'app/mbPlayerListContainer/mbPlayerListContainer.html',
      restrict: 'EAC',
      scope: {
        container: "=container"
      },
      link: function (scope, element, attrs) {
        scope.undrscr = window._;
        scope.actionsToggled = [];
        scope.toggleActions = function ($index) {
          var oldState = !!scope.actionsToggled[$index];
          scope.actionsToggled = [];
          scope.actionsToggled[$index] = !oldState;
        };
        scope.$watch('container', function () {
          $timeout(function () {
            var container = angular.element(element[0].parentElement);
          }, 1000, true);
        });
      }
    };
  })
  .filter('mbPlayerListFilter', function () {
    return function (items, entry) {
      var sortedItems = (entry && entry.sort && entry.sort(items));
      if (!sortedItems) sortedItems = items;
      return sortedItems;
    }
  });
