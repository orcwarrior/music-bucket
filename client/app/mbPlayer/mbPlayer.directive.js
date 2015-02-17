'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayer', function () {
    return {
      templateUrl: 'app/mbPlayer/mbPlayer.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });