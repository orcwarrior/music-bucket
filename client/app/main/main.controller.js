'use strict';

angular.module('musicBucketApp')
  .controller('MainCtrl',
              function ($rootScope, $scope, $http, socket, Auth, angularPlayer, playlistLocalStorage, songCommons, playlistService, playlist, hotkeys) {
                // Loading playlist from cookies:
                // TODO: Next song played, store playlist state in localstorage
                // TODO#2: Playlist should be FULLY recreated by LSProvider
                // TODO#3: Having this mechanics here is fuckedup
                var lsPlaylist = playlistLocalStorage.restoreFromLocalstorage();
                if (!_.isNull(lsPlaylist)) {
                  angularPlayer.setPlaylist(playlist.constructor(lsPlaylist));
                }

                $scope.savePlaylist = function () {
                  // NOTE: If playlist is based on another author playlist, reset name
                  // so new user can rename it.
                  var playlist = angularPlayer.playlist;
                  if (playlist.author !== Auth.getCurrentUser()._id) {
                    playlist.id = undefined;
                    playlist.name = '';
                    playlist.author = Auth.getCurrentUser()._id;
                  }

                  if (playlist.name === '') playlist.settingPlaylistName = true;

                  if (playlist.settingPlaylistName) {
                    if (playlist.name === '') return;
                    else
                      playlist.settingPlaylistName = false;
                  }

                  playlistService.save(playlist)
                    .then(function (response) {
                            playlist.id = response._id;
                            playlist.isAltered = false;
                          });
                }
                $scope.userLoggedIn = function () {
                  return Auth.isLoggedIn();
                }
                $rootScope.player = angularPlayer;

                $rootScope.player.playerProgressClickEvent = function (event) {
                  var SMSound = soundManager.getSoundById($scope.player.getCurrentTrack().id);
                  var newProgress = event.clientX / event.currentTarget.firstChild.clientWidth;

                  $scope.player.progress.current = Math.round(newProgress * 100) + "%";
                  soundManager.setPosition(SMSound.id, SMSound.duration * newProgress);
                  //$scope.$apply();
                };

                // Playlist items dropdowns:
                $scope.playlistItemDropdown = false;
                $scope.togglePlaylistItemDropdown = function ($event) {
                  $event.preventDefault();
                  $event.stopPropagation();
                  $scope.status.isopen = !$scope.status.isopen;
                };

                $scope.getNextSongDescription = function (song) {
                  if (_.isNull(song)) return '';
                  return song.shared.getSongDescription();
                }
                // Progress update:
                $scope.player.progress = {current: "25%", buffered: "50%"};
                $scope.$on('track:progress', function (event, data) {
                  var progress = (data === null
                  ) ? "0%" : Math.round(data) + "%"
                  $scope.player.progress.current = progress;
                  $scope.$broadcast('playerProgressbar:update', $scope.player.progress);

                });
                $scope.$on('currentTrack:bytesLoaded', function (event, data) {
                  var progress = (data.loaded === null
                  ) ? "0%" : Math.round(data.loaded * 100) + "%"
                  $scope.player.progress.buffered = progress;
                  $scope.$broadcast('playerProgressbar:update', $scope.player.progress);
                });
                // New track playing: (store playlist in LS)
                $scope.$on('track:id', function (event, data) {
                  angularPlayer.playlist.storeInLocalstorage();
                });

                // Initialize hotkeys:
                hotkeys.bindTo($rootScope)
                  .add({
                    combo: ['space', 'stop-playing'],
                    description: 'Toggle playing',
                    callback: _.bind(angularPlayer.togglePlay, angularPlayer)
                  })
                  .add({
                    combo: ['mod+up','next-track'],
                    description: 'Play next track',
                    action: 'keydown',
                    callback: _.bind(angularPlayer.nextTrack, angularPlayer)
                  })
                  .add({
                    combo: ['mod+down','prev-track'],
                    description: 'Rewind to previous track',
                    action: 'keydown',
                    callback: _.bind(angularPlayer.prevTrack, angularPlayer)
                  })

              });
