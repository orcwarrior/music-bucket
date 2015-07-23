'use strict';

angular.module('musicBucketApp')
  .directive('youtubeEntry', function (mbPlayerEngine, youtubeEntry) {
    return {
      templateUrl: 'app/trackViews/youtubeEntry/youtubeEntry.html',
      restrict: 'EA',
      scope: {
        entry: '=entry'
      },
      link: function (scope, element, attrs) {
        scope.addToPlaylist = function (entry) {
          var ytEntry = new youtubeEntry(entry.id);
          mbPlayerEngine.addToPlaylist(ytEntry);
        };
      }
    };
  });
