'use strict';

angular.module('musicBucketApp')
  .directive('playerProgressbar', function () {
    return {
      templateUrl: 'app/playerProgressbar/playerProgressbar.html',
      restrict: 'EA',
      scope: {
        progressCurrent: '=current',
        progressBuffered: '=buffered'
      },
      link: function (scope, element, attrs) {
        scope.current = { width : attrs['current']};
        scope.buffered = { width : attrs['buffered']};
        scope.clickHandler = attrs['clickHandler'];
      }
    };
  });
