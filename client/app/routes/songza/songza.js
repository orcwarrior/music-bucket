'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.songza', {
        url        : '/songza',
        templateUrl: 'app/routes/songza/songza.html',
        controller : 'SongzaCtrl'
      });
  });
