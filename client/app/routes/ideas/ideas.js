'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
    $stateProvider
      .state('main.ideas',{
               url : '/ideas',
               templateUrl: 'app/routes/ideas/ideas.html',
               controller : 'IdeasCtrl'
             });
  });
