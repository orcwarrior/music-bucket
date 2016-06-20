'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.spotify.categories', {
        url        : '/categories/:categoryId',
        templateUrl: 'app/routes/spotify/categories/spotify.categories.html',
        controller : 'SpotifyCategoriesCtrl'
      });
  });
