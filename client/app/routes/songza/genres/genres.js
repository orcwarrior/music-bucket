'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.songza.genres', {
        url        : '/genres',
        templateUrl: 'app/routes/songza/genres/genres.html',
        controller : 'SongzaGenresCtrl'
      });
  });
