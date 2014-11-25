'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
            $stateProvider
              .state('main.local', {
                       url        : '/local',
                       templateUrl: 'app/local/local.html',
                       controller : 'LocalCtrl'
                     });
          });
