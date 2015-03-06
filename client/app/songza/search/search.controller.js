'use strict';

angular.module('musicBucketApp')
  .controller('SongzaSearchCtrl',
  function ($scope, $location, $state, angularPlayer, songzaStationEntry, songzaApi) {

    $scope.searchQuery = $location.search().query;
    $scope.searchInProgress = false;
    $scope.searchStations = function (query) {
      $scope.searchInProgress = true;
      $scope.foundedStations = null;
      $location.search('query', query);
      $location.replace();
      songzaApi.search.station(query)
        .then(function (response) {
          response = response.data; // TMP!!!
          //$scope.$apply(function () {
          $scope.foundedStations = response;
          $scope.searchInProgress = false;
          //              }
          //);
        });
    };

    $scope.gotoStation = function (stationId) {
      //$state.go('^songza/station', {'id': stationId});
    };

    // if search query was passed, run station search
    if (!_.isUndefined($scope.searchQuery) && $scope.searchQuery !== "") {
      $scope.searchStations($scope.searchQuery);
    }

    $scope.addToPlaylist = function (station) {
      var stationEntry = new songzaStationEntry(station);
      angularPlayer.addToPlaylist(stationEntry);
    }
  });
