'use strict';

angular.module('musicBucketApp')
  .controller('MusicPlayerCtrl', function ($scope) {
                $scope.$on('player:playlist', function(event, data) {
                  $scope.$apply();
                });
  });
