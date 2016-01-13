'use strict';

angular.module('musicBucketApp')
  .controller('MainIntroCtrl', function ($scope, $http) {
    $scope.windLoc = window.location.host;

    $http.get('/api/songzaLurker/stats')
      .then(function (response) {
        $scope.songzaLurkerStats = response.data;
      })
  });
