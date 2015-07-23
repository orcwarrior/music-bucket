'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.songza.decades', {
        url        : '/decades',
        templateUrl: 'app/routes/songza/decades/decades.html',
        controller : 'SongzaDecadesCtrl'
      });
  });
