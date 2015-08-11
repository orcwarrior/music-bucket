'use strict';

angular.module('musicBucketApp')
  .directive('youtubeEntry', function (mbPlayerEngine, youtubeEntry, $mdDialog) {
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
