'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerMainControls', function (angularPlayer) {
    return {
      templateUrl: 'app/mbPlayerMainControls/mbPlayerMainControls.html',
      restrict: 'E',
      scope : {},
      link: function (scope, element, attrs) {
        scope.player = angularPlayer;

        scope.getNextSongDescription = function (song) {
          if (_.isNull(song)) return '';
          return song.metainfos.getSongDescription();
        };
      }
    };
  });
