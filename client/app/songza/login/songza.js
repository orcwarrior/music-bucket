'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
            $stateProvider
              .state('main.songza.login', {
                       url        : '/songza',
                       templateUrl: 'app/songza/songza.html',
                       controller : 'SongzaCtrl'
                     });
          });
