'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.search', {
        url: '/search?query',
        templateUrl: 'app/routes/search/search.html',
        controller : 'SearchCtrl'
      })
  });
