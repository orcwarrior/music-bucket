'use strict';

angular.module('musicBucketApp')
  .controller('LoginCtrl', function ($scope, Auth, $location) {
    $scope.user = { email: 'admin@admin.com', password: 'admin'};
    $scope.errors = {};

    $scope.login = function(form) {
      $scope.submitted = true;

      if(form.$valid) {
        Auth.login({
          email: $scope.user.email,
          password: $scope.user.password
        })
        .then( function() {
          // Logged in, redirect to home
          $location.path('/');
        })
        .catch( function(err) {
          $scope.errors.other = err.message;
        });
      }
    };

  });
