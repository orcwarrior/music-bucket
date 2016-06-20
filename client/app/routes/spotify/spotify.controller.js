'use strict';

angular.module('musicBucketApp')
  .controller('SpotifyCtrl', function ($scope, $window, $location, $state, spotifyApi) {

    var tabUrls = {
      "/spotify/featured" : 0,
      "/spotify/categories" : 1,
      "/spotify/search" : 2,
      "/spotify/user" : 3
    };
    $scope.selectedSpotifyTab = tabUrls[$location.url()];
    $scope.spotifyAuth = function () {
      spotifyApi.accounts.authorize()
        .then(function (authToken) {
          refreshView();
        });
    };
    $scope.$on('spotifyApi:authorized', function () {
      refreshView();
    });
    $scope.isAuthorized = spotifyApi.accounts.isAuthorized();
    $scope.getMe = function () {
      if (spotifyApi.accounts.isAuthorized())
        spotifyApi.me().then(function (response) {
          $scope.me = response.data;
        })
    }
    $scope.getMe();
    $scope.disconnectSpotify = function () {
      spotifyApi.accounts.clearToken();
      $state.transitionTo('main.spotify');
    };
    function refreshView() {
      $scope.isAuthorized = spotifyApi.accounts.isAuthorized();
      $scope.getMe();
    }

  });
