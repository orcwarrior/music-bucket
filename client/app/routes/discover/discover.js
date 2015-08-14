'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.discover', {
        url: '/discover?artist&title&album',
        templateUrl: 'app/routes/discover/discover.html',
        controller: 'discoverCtrl',
        reloadOnSearch: false
      });
  });
