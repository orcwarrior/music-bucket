'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerMainControls', function (mbPlayerEngine) {
    return {
      templateUrl: 'app/mbPlayerMainControls/mbPlayerMainControls.html',
      restrict: 'E',
      scope : {},
      link: function (scope, element, attrs) {
        scope.player = mbPlayerEngine;

        scope.getSongDescription = function (song) {
          if (_.isNull(song)) return '';
          return song.metainfos.getSongDescription();
        };
        scope.getLastSongDescription = function() {
          if (_.isUndefined(mbPlayerEngine.tracksHistory) || _.isUndefined(mbPlayerEngine.tracksHistory.peekLastSong()))
            return "";
          else
            return scope.getSongDescription(mbPlayerEngine.tracksHistory.peekLastSong());
        }
      }
    };
  });
