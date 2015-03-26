'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayer', function (mbPlayerEngine) {
    return {
      templateUrl: 'app/mbPlayer/mbPlayer.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {


        scope.playerProgressClickEvent = function (event) {
          var newProgress = event.clientX / event.currentTarget.firstChild.clientWidth;
          scope.playerProgress.current = Math.round(newProgress * 100) + "%";
          mbPlayerEngine.setPosition(mbPlayerEngine.getCurrentSong().metainfos.getDuration() * newProgress);
        };

        // Progress update events:
        scope.playerProgress = {current: "0%", buffered: "0%"};
        scope.$on('track:progress', function (event, data) {
          var progress = (data === null ) ? "0%" : Math.round(data * 100) + "%";
          scope.playerProgress.current = progress;
          scope.$broadcast('playerProgressbar:update', scope.playerProgress);

        });
        scope.$on('currentTrack:bytesLoaded', function (event, data) {
          var progress = (data.progress === null ) ? "0%" : Math.round(data.progress * 100) + "%";
          scope.playerProgress.buffered = progress;
          scope.$broadcast('playerProgressbar:update', scope.playerProgress);
        });
      }
    };
  });
