'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.spotify.featured', {
        url        : '/featured',
        templateUrl: 'app/routes/spotify/featured/spotify.featured.html',
        controller : 'SpotifyFeaturedCtrl'
      });
  });
