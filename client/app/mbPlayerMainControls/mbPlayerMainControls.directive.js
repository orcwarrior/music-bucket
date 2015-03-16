'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerMainControls', function (angularPlayer) {
    return {
      templateUrl: 'app/mbPlayerMainControls/mbPlayerMainControls.html',
      restrict: 'E',
      scope : {},
      link: function (scope, element, attrs) {
        scope.player = angularPlayer;

        scope.getSongDescription = function (song) {
          if (_.isNull(song)) return '';
          return song.metainfos.getSongDescription();
        };
        scope.getLastSongDescription = function() {
          if (_.isUndefined(angularPlayer.tracksHistory) || _.isUndefined(angularPlayer.tracksHistory.peekLastSong()))
            return "";
          else
            return scope.getSongDescription(angularPlayer.tracksHistory.peekLastSong());
        }
      }
    };
  });
