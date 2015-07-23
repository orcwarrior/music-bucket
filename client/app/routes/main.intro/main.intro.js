'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.intro', {
        url: '/?theater',
        templateUrl: 'app/routes/main.intro/main.intro.html',
        controller: 'MainIntroCtrl'
      });
  });
