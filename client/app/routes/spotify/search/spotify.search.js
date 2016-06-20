'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.spotify.search', {
        url        : '/search',
        templateUrl: 'app/routes/spotify/search/spotify.search.html',
        controller : 'SpotifySearchCtrl'
      });
  });
