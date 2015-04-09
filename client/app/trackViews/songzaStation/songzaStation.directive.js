'use strict';

angular.module('musicBucketApp')
  .directive('songzaStation', function () {
    return {
      templateUrl: 'app/trackViews/songzaStation/songzaStation.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });