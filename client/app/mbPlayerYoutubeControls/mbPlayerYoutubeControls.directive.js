'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerYoutubeControls', function () {
    return {
      templateUrl: 'app/mbPlayerYoutubeControls/mbPlayerYoutubeControls.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
      }
    };
  });