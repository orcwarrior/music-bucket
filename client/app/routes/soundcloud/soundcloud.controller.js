'use strict';

angular.module('musicBucketApp')
  .controller('SoundcloudCtrl', function ($scope, $location, soundcloudApi) {
    $scope.message = 'Hello';
    $scope.searchQuery = $location.search().query;

    $scope.search = function(query) {
      $location.search('query', query);
      $location.replace();
      soundcloudApi.search.track(query)
        .then( function (response) {
          $scope.searchResults = response.data;
        });
    };
    if ($scope.searchQuery) $scope.search($scope.searchQuery);
  });
