'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
            $stateProvider
              .state('main.local', {
                       url        : '/local',
                       templateUrl: 'app/routes/local/local.html',
                       controller : 'LocalCtrl'
                     });
          });
