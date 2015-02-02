'use strict';

angular.module('musicBucketApp')
  .controller('PlaylistsCtrl', function ($scope, $http, angularPlayer, Auth, playlistDBFactory, playlistService) {

                function getPlaylists() {
                  $http.get('/api/playlist')
                    .success(function (response) {
                               $scope.playlists = response;
                             });
                };
                getPlaylists();

                $scope.loadPlaylist = function (playlist) {
                  var loadedPlaylist = playlistDBFactory.convertFrom(playlist);
                  loadedPlaylist.storeInLocalstorage();
                  angularPlayer.setPlaylist(playlistDBFactory.convertFrom(playlist));
                };
                $scope.isPlaylistOwner = function (playlist) {
                  var curId = Auth.getCurrentUser()._id;
                  // if (curId === playlist.author) console.log("Cur user is playlist author!");
                  return (playlist.author === curId);
                }
                $scope.deletePlaylist = function (playlist) {
                  // TODO: On playlist remove error, show some msg
                  var result = playlistService.remove(playlist);
                  getPlaylists();
                }

              });
