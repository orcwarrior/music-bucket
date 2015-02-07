'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
            $stateProvider
              .state('main.youtube', {
                       url        : '/youtube',
                       templateUrl: 'app/youtube/youtube.html',
                       controller : 'YoutubeCtrl'
                     });
          });
