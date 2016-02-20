'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerListHeader', function () {
    return {
      templateUrl: 'app/mbPlayerListHeader/mbPlayerListHeader.html',
      restrict: 'EAC',
      scope : {
        header: "=header"
      },
      link: function (scope, element, attrs) {
      }
    };
  });
