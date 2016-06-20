'use strict';

angular.module('musicBucketApp')
  .controller('SpotifyFeaturedCtrl', function ($scope, spotifyApi) {

    spotifyApi.browse.featuredPlaylists()
      .then(function (response) {
        $scope.featuredPlaylists = response.data;
      });
    spotifyApi.browse.newReleases()
      .then(function (response) {
        $scope.newReleases = response.data;
      });
  });

