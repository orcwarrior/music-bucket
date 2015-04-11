'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
            $stateProvider
              .state('main.songza.search', {
                       url        : '/search',
                       templateUrl: 'app/routes/songza/search/search.html',
                       controller : 'SongzaSearchCtrl'
                     });
          });
