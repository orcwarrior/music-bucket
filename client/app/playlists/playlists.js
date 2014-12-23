'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
      $stateProvider
        .state('main.playlists', {
                 templateUrl: 'app/playlists/playlists.html',
                 controller : 'PlaylistsCtrl'
               });
  });
