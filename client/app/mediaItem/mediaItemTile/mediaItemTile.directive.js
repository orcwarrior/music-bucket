'use strict';

angular.module('musicBucketApp')
  .directive('mediaItemTile', function ($q, $mdDialog, mediaItemBuilder, mediaItemEntryBuilder, mediaItemTypes, mbPlayerEngine) {
    return {
      templateUrl: 'app/mediaItem/mediaItemTile/mediaItemTile.html',
      restrict: 'EA',
      scope: {
        item: "=item"
      },
      link: function (scope, element, attrs) {
        //scope.item = mediaItemBuilder(scope.item);
        scope.$watch('item', function (newItem) {
          if (newItem && !newItem.__isAnMediaItemObject) {
            scope.item = mediaItemBuilder(newItem);
          }
        });

        scope.moreInfos = function (ev) {
          $mdDialog.show({
            controller: 'mediaItemController',
            templateUrl: 'app/mediaItem/mediaItemTemplate/mediaItem.view.template.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            locals: {
              'item': scope.item
            }
          });
        };
        scope.addToPlaylist = function () {
          scope.item._resolvePlaylist()
            .then(function (itemWithTracks) {
              var mediaItemEntry = mediaItemEntryBuilder.build(scope.item);
              $q.when(mediaItemEntry, function (buildedEntry) {
                if (mbPlayerEngine.getPlaylist().findEntry(buildedEntry) != buildedEntry) {
                  mbPlayerEngine.addToPlaylist(buildedEntry);
                }
                mbPlayerEngine.getPlaylist().alter();
              });
            });
        };
      }
    };
  });
