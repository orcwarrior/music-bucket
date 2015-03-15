'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
            $stateProvider
              .state('main.youtube', {
                       url        : '/youtube',
                       templateUrl: 'app/routes/youtube/youtube.html',
                       controller : 'YoutubeCtrl'
                     });
          });
