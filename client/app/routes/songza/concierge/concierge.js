'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.songza.concierge', {
        url        : '/concierge',
        templateUrl: 'app/routes/songza/concierge/concierge.html',
        controller : 'SongzaConciergeCtrl'
      });
  });
