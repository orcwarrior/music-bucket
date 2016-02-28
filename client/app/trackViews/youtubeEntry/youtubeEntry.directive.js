'use strict';

angular.module('musicBucketApp')
  .directive('youtubeEntry', function ($q, mbPlayerEngine, youtubeEntryBuilder, $mdDialog) {
    return {
      templateUrl: 'app/trackViews/youtubeEntry/youtubeEntry.html',
      restrict: 'EA',
      scope: {
        entry: '=entry'
      },
      link: function (scope, element, attrs) {
        scope.addToPlaylist = function (entry) {
          var ytEntry = youtubeEntryBuilder.build(entry.id);
          $q.when(ytEntry, function (buildedEntry) {
            if (mbPlayerEngine.getPlaylist().findEntry(buildedEntry) != buildedEntry)
              mbPlayerEngine.addToPlaylist(buildedEntry);
            mbPlayerEngine.getPlaylist().alter();
          });
          // mbPlayerEngine.addToPlaylist(ytEntry);
        };
        scope.moreInfos = function (ev) {
          $mdDialog.show({
            controller: 'YTEntryDialogController',
            templateUrl: 'app/templates/ytEntry.view.template.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            locals: {
              'entry': scope.entry
            }
          });
        };
      }
    };
  });
