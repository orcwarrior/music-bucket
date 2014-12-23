'use strict';

angular.module('musicBucketApp')
    .controller('SongzaCtrl', function ($scope, $rootScope) {
   // var Songza = require('./Songza ');

   // var songza = new Songza({ userAgent: 'myApp/v0.0.1' });

    $scope.user = {};
    $scope.login = function (form) {
        $scope.submitted = true;

        if (form.$valid) {
            $rootScope.songza.auth.login($scope.user.login, $scope.user.password)
                .then(function (response) {
                           console.log(response);
                           $scope.songza.response = response;
                      })
                .catch(function (err) {
                           $scope.errors.other = err.message;
                       });
        }
    };
});
