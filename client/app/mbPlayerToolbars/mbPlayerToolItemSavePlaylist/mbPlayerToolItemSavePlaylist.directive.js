'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerToolItemSavePlaylist', function ($mdDialog, mbPlayerEngine, playlistService) {
    return {
      templateUrl: 'app/mbPlayerToolbars/mbPlayerToolItemSavePlaylist/mbPlayerToolItemSavePlaylist.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        scope.player = mbPlayerEngine;

        scope.savePlaylist = function () {
          if (!_.isUndefined(mbPlayerEngine.getPlaylist())) {
            playlistService.save(mbPlayerEngine.getPlaylist());
          }
        };
        scope.savePlaylistDialog = function (ev) {
          $mdDialog.show({
            controller: 'PlaylistSaveDialogController',
            templateUrl: 'app/templates/playlist.edit.template.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            locals: {
              'playlist': mbPlayerEngine.playlist
            },
          })
            .then(function (answer) {
              scope.alert = 'You said the information was "' + answer + '".';
            }, function () {
              scope.alert = 'You cancelled the dialog.';
            });

        }
      }
    };
  });
