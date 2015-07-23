'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.songza.activities', {
        url        : '/activities',
        templateUrl: 'app/routes/songza/activities/activities.html',
        controller : 'SongzaActivitiesCtrl'
      });
  });
