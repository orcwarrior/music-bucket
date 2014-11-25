'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
            $stateProvider
              .state('main.songza', {
                       url        : '/songza',
                       templateUrl: 'app/songza/songza.html',
                       controller : 'SongzaCtrl'
                     });
          });
