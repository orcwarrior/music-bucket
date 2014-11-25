'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
            $stateProvider
              .state('main.login', {
                      url        : '/login',
                      templateUrl: 'app/account/login/login.html',
                      controller : 'LoginCtrl'
                    })
              .state('signup', {
                      url        : '/signup',
                      templateUrl: 'app/account/signup/signup.html',
                      controller : 'SignupCtrl'
                    })
              .state('main.settings', {
                      templateUrl : 'app/account/settings/settings.html',
                      controller  : 'SettingsCtrl',
                      authenticate: true
                    });
          });
