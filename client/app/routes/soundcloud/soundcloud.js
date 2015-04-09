'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.soundcloud', {
        url        : '/soundcloud',
        templateUrl: 'app/routes/soundcloud/soundcloud.html',
        controller : 'SoundcloudCtrl'
      });
  });
