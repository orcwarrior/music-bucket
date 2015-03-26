'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerSm2Controls', function (mbPlayerEngine) {
    return {
      templateUrl: 'app/mbPlayerSm2Controls/mbPlayerSm2Controls.html',
      restrict: 'EA',
      scope: {},
      link: function (scope, element, attrs) {
        scope.player = mbPlayerEngine;
      }
    };
  });
