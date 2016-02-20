'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayer', function (mbPlayerEngine) {
    return {
      templateUrl: 'app/mbPlayer/mbPlayer.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {


        scope.$on('player:working', function (event, data) {
          _.delay(function () {
            scope.$apply(function () {
              scope.isPlayerWorking = data;
            });
          }, 50);
        });
        scope.playerProgressClickEvent = function (event) {
          var newProgress = event.clientX / event.currentTarget.firstChild.clientWidth;
          scope.playerProgress.current = Math.round(newProgress * 100) + "%";
          var song = mbPlayerEngine.getCurrentSong();
          var duration = song.getDuration();
          mbPlayerEngine.setPosition(duration * newProgress);
        };

        // Progress update events:
        scope.playerProgress = {current: "0%", buffered: "0%"};
        scope.$on('track:progress', function (event, data) {
          var progress = (data === null ) ? "0%" : Math.round(data * 10000) / 100 + "%";
          scope.playerProgress.current = progress;
          scope.$broadcast('playerProgressbar:update', scope.playerProgress);

        });
        scope.togglePlaylistMenu = function (opened) {
          mbPlayerEngine.theaterMode.playlistMenuToggled = opened;
        }
        scope.$on('currentTrack:bytesLoaded', function (event, data) {
          var progress = (data.progress === null ) ? "0%" : Math.round(data * 10000) / 100  + "%";
          scope.playerProgress.buffered = progress;
          scope.$broadcast('playerProgressbar:update', scope.playerProgress);
        });
      }
    };
  });
