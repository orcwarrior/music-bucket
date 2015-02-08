'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerSm2Controls', function () {
    return {
      templateUrl: 'app/mbPlayerSm2Controls/mbPlayerSm2Controls.html',
      restrict: 'EA',
      scope: true,
      link: function (scope, element, attrs) {
      }
    };
  });
