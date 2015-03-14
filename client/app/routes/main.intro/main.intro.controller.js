'use strict';

angular.module('musicBucketApp')
  .controller('MainIntroCtrl', function ($scope) {
    $scope.windLoc = window.location.host;
  });
