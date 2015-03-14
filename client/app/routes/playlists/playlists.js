'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
      $stateProvider
        .state('main.playlists',{
                 url : '/playlists',
                 templateUrl: 'app/routes/playlists/playlists.html',
                 controller : 'PlaylistsCtrl'
               });
  });
