'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.search', {
        url: '/search',
        templateUrl: 'app/routes/search/search.html',
        controller : 'SearchCtrl'
      })
  });
