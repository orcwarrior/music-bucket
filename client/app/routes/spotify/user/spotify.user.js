'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.spotify.user', {
        url        : '/user',
        templateUrl: 'app/routes/spotify/user/spotify.user.html',
        controller : 'SpotifyUserCtrl'
      });
  });

