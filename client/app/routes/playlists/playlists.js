'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
      $stateProvider
        .state('main.playlists',{
                 url : '/playlists?autoplay&id&theater',
                 templateUrl: 'app/routes/playlists/playlists.html',
                 controller : 'PlaylistsCtrl'
               });
  });
