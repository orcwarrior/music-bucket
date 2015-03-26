'use strict';

angular.module('musicBucketApp')
  .controller('MainCtrl',
              function ($rootScope, $scope, $http, socket, Auth, mbPlayerEngine, playlistLocalStorage, songCommons, playlistService, playlist, hotkeys) {
                // Loading playlist from cookies:
                // TODO: Next song played, store playlist state in localstorage
                // TODO#2: Playlist should be FULLY recreated by LSProvider
                // TODO#3: Having this mechanics here is fuckedup
                var lsPlaylist = playlistLocalStorage.restoreFromLocalstorage();
                if (!_.isNull(lsPlaylist)) {
                  console.log("LS Playlist:"); console.log(lsPlaylist);
                  mbPlayerEngine.setPlaylist(new playlist(lsPlaylist));
                }

                $scope.userLoggedIn = function () {
                  return Auth.isLoggedIn();
                }
                $rootScope.player = mbPlayerEngine;

                // Playlist items dropdowns:
                $scope.playlistItemDropdown = false;
                $scope.togglePlaylistItemDropdown = function ($event) {
                  $event.preventDefault();
                  $event.stopPropagation();
                  $scope.status.isopen = !$scope.status.isopen;
                };
                // New track playing: (store playlist in LS)
                $scope.$on('track:id', function (event, data) {
                  mbPlayerEngine.getPlaylist().storeInLocalstorage();
                });

                // Initialize hotkeys:
                hotkeys.bindTo($rootScope)
                  .add({
                    combo: ['space', 'stop-playing'],
                    description: 'Toggle playing',
                    callback: _.bind(mbPlayerEngine.togglePlay, mbPlayerEngine)
                  })
                  .add({
                    combo: ['mod+up','next-track'],
                    description: 'Play next track',
                    action: 'keydown',
                    callback: _.bind(mbPlayerEngine.nextTrack, mbPlayerEngine)
                  })
                  .add({
                    combo: ['mod+down','prev-track'],
                    description: 'Rewind to previous track',
                    action: 'keydown',
                    callback: _.bind(mbPlayerEngine.prevTrack, mbPlayerEngine)
                  })

              });
