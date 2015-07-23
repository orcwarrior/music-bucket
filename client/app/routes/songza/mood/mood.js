'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.songza.mood', {
        url        : '/mood',
        templateUrl: 'app/routes/songza/mood/mood.html',
        controller : 'SongzaMoodCtrl'
      });
  });
