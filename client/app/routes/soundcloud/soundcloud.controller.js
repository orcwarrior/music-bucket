'use strict';

angular.module('musicBucketApp')
  .controller('SoundcloudCtrl', function ($scope, soundcloudApi) {
    $scope.message = 'Hello';

    $scope.search = function(query) {
      soundcloudApi.search.track(query)
        .then( function (response) {
          $scope.searchResults = response.data;
        });
    }
  });
