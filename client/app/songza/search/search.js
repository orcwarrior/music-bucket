'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
            $stateProvider
              .state('main.songza', {
                       url        : '/songza',
                       templateUrl: 'app/songza/search/search.html',
                       controller : 'SongzaSearchCtrl'
                     });
          });
