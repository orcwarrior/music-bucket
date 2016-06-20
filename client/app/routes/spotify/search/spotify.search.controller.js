'use strict';

angular.module('musicBucketApp')
  .controller('SpotifySearchCtrl', function ($scope, $location, spotifyApi) {

    $scope.searchQuery = $location.search().query;
    $scope.searchInProgress = false;
    $scope.search = function (query) {
      $scope.searchInProgress = true;
      $scope.searchResults = null;
      $location.search('query', query);
      $location.replace();

      spotifyApi.search(query, "playlist", 24)
        .then(function (response) {
          $scope.searchResults = response.data.playlists;
          $scope.searchInProgress = false;
        });
    };

    // if search query was passed, run station search
    if (!_.isUndefined($scope.searchQuery) && $scope.searchQuery !== "") {
      $scope.search($scope.searchQuery);
    }
  });
