'use strict';

angular.module('musicBucketApp')
  .directive('soundcloudTrack', function (mbPlayerEngine) {
    return {
      templateUrl: 'app/trackViews/soundcloudTrack/soundcloudTrack.html',
      restrict: 'EA',
      scope: {
         track: '=track'
      },
      link: function (scope, element, attrs) {
        scope.addToPlaylist = function(track) {
          mbPlayerEngine.addToPlaylist(null);
        }
        scope.changeArtworkSizeUrl = function (url) {
          return url.replace("-large.jpg","-crop.jpg");
        }
      }
    };
  });
