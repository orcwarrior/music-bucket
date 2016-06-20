'use strict';

angular.module('musicBucketApp')
  .controller('SpotifyUserCtrl', function ($scope, spotifyApi) {
    spotifyApi.me()
      .then(function (response) {
        $scope.user = response.data;
        spotifyApi.users.playlists.all($scope.user.id)
          .then(function (response) {
            $scope.myPlaylists = response.data;
          });
      });
  });
