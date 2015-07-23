'use strict';

angular.module('musicBucketApp')
  .controller('MainCtrl',
              function ($rootScope, $scope, $http, $location, socket, Auth, mbPlayerEngine, playlistLocalStorage, songCommons, playlistService, playlist, hotkeys) {
                var autoplay = $location.search().autoplay;
                var theaterMode = $location.search().theater;
                // Loading playlist from cookies:
                // TODO#2: Playlist should be FULLY recreated by LSProvider
                // TODO#3: Having this mechanics here is fuckedup
                soundManager.onready(function() {
                  if (autoplay) return; // BUGFIX: When autoplay argument is active, don't load LS playlist!
                  var lsPlaylist = playlistLocalStorage.restoreFromLocalstorage();
                  if (!_.isNull(lsPlaylist)) {
                    console.log("LS Playlist:"); console.log(lsPlaylist);
                    mbPlayerEngine.setPlaylist(new playlist(lsPlaylist));
                  }
                });

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

                // User Idle in theater mode:
                $scope.$on('IdleStart', function() {
                  // the user appears to have gone idle
                  console.log("IDLE START!");
                  if (mbPlayerEngine.theaterMode.enabled) {
                    //mbPlayerEngine.theaterMode.playlistMenuToggled = false;
                    mbPlayerEngine.theaterMode.userIdle = true;
                  }
                });

                $scope.$on('IdleEnd', function() {
                  // the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog
                  $scope.$apply(function() {
                    mbPlayerEngine.theaterMode.userIdle = false;
                  });
                  console.log("IDLE END!");
                });

                mbPlayerEngine.theaterMode.enabled = !_.isUndefined(theaterMode);

              });
