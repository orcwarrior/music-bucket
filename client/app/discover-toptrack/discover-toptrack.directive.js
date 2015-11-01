'use strict';

angular.module('musicBucketApp')
  .directive('discoverToptrack', function () {
    return {
      templateUrl: 'app/discover-toptrack/discover-toptrack.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });