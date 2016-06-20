'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('featured', {
        url        : '/spotify/logincb',
        templateUrl: 'app/routes/spotify/logincb/spotify.logincb.html',
        controller : 'SpotifyLoginCbCtrl'
      });
  });
