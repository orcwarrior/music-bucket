'use strict';

angular.module('musicBucketApp')
  .controller('SearchCtrl', function ($scope, $location, searchApisRegistry, searchDefinition) {
    $scope.searchQuery = $location.search().query;
    $scope.search = function (query) {
      $location.search('query', query);
      $location.replace();
      $scope.foundMediaCollections = searchApisRegistry.search(new searchDefinition('playlist', {query: query}));
    };
    if ($scope.searchQuery)
      $scope.search($scope.searchQuery);
  });
