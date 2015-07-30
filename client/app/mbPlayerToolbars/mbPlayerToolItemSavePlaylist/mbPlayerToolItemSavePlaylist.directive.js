'use strict';

angular.module('musicBucketApp')
  .directive('mbPlayerToolItemSavePlaylist', function ($mdDialog, mbPlayerEngine, playlistService) {
    return {
      templateUrl: 'app/mbPlayerToolbars/mbPlayerToolItemSavePlaylist/mbPlayerToolItemSavePlaylist.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        scope.player = mbPlayerEngine;

        scope.isMinePlaylist = function () {
          if (_.isUndefined(mbPlayerEngine.getPlaylist().author)) {
            return true;
          }
          return (playlistService.isPlaylistOwner(mbPlayerEngine.getPlaylist()));
        };
        scope.getPlaylistIcon = function () {
          if (playlistService.isPlaylistOwner(mbPlayerEngine.getPlaylist()))
            return 'mdi-content-save';
          else
            return 'mdi-action-info';
        };
        scope.savePlaylistDialog = function (ev) {
          $mdDialog.show({
            controller: 'PlaylistSaveDialogController',
            templateUrl: 'app/templates/playlist.edit.template.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            locals: {
              'playlist': mbPlayerEngine.playlist
            }
          })
            .then(function (answer) {
              scope.alert = 'You said the information was "' + answer + '".';
            }, function () {
              scope.alert = 'You cancelled the dialog.';
            });

        };
        scope.viewPlaylistDialog = function (ev) {
          var extendedPlaylist;
          playlistService.get(mbPlayerEngine.playlist.id)
            .then(function (response) {
              extendedPlaylist = _.extend(mbPlayerEngine, response.data);
              $mdDialog.show({
                controller: 'PlaylistSaveDialogController',
                templateUrl: 'app/templates/playlist.view.template.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                locals: {
                  'playlist': extendedPlaylist
                }
              });
            });

        };

      }
    };
  });
