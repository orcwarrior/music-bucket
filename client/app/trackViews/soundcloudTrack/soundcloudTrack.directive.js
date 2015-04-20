'use strict';

angular.module('musicBucketApp')
  .directive('soundcloudTrack', function (mbPlayerEngine, soundcloudEntry) {
    return {
      templateUrl: 'app/trackViews/soundcloudTrack/soundcloudTrack.html',
      restrict: 'EA',
      scope: {
        track: '=track'
      },
      link: function (scope, element, attrs) {
        scope.addToPlaylist = function (track) {
          mbPlayerEngine.addToPlaylist(new soundcloudEntry(track));
        }
        scope.changeArtworkSizeUrl = function (url) {
          if (url)
            return url.replace("-large.jpg", "-crop.jpg");
          else
            return "";
        }
      }
    };
  });
