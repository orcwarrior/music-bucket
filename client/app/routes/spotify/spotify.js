'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.spotify', {
        url        : '/spotify',
        templateUrl: 'app/routes/spotify/spotify.html',
        controller : 'SpotifyCtrl',
        redirectTo: 'main.spotify.featured'
      });
  });
