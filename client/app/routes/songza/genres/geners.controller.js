'use strict';

angular.module('musicBucketApp')
  .controller('SongzaGenresCtrl', function ($scope, $location, songzaApi) {
    $scope.grouping = "genres";
    if (_.isUndefined($scope.genres))
    songzaApi.genres()
      .then(function (genres) {
        $scope.genres = genres.data.galleries;
        if ($location.search().slug) {
          $scope.selectedGenere = _.find($scope.genres, function (act) {
            return act.slug === $location.search().slug;
          });
          if (!_.isUndefined($scope.selectedGenere))
            loadGenereStations();
        }
      });
    function loadGenereStations() {
      $scope.stations = null;
      songzaApi.station.multi($scope.selectedGenere.stations)
        .then(function (response) {
          $scope.stations = response.data;
          $location.replace();
        });

    }
    $scope.setGenere = function (activity) {
      $scope.selectedGenere = activity;
      $location.search('slug', activity.slug);
      $location.replace();
      loadGenereStations();
    };


  });
