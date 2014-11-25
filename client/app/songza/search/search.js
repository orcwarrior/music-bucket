'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
            $stateProvider
              .state('main.songza.search', {
                       url        : '/songza/search',
                       templateUrl: 'app/songza/search/search.html',
                       controller : 'SongzaSearchCtrl'
                     });
          });
