'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
            $stateProvider
              .state('main', {
                       abstract: true,
                       templateUrl: 'app/routes/main/main.html',
                       controller : 'MainCtrl'
                     })
  });
