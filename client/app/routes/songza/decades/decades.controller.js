'use strict';

angular.module('musicBucketApp')
  .controller('SongzaDecadesCtrl', function ($scope, $location, songzaApi) {
    $scope.grouping = "decades";
    if (_.isUndefined($scope.decades))
    songzaApi.decades()
      .then(function (activities) {
        $scope.decades = activities.data;
        if ($location.search().slug) {
          $scope.selectedDecade = _.find($scope.decades, function (act) {
            return act.slug === $location.search().slug;
          });
          if (!_.isUndefined($scope.selectedDecade))
            loadDecadeStations();
        }
      });
    function loadDecadeStations() {
      $scope.stations = null;
      songzaApi.station.multi($scope.selectedDecade.station_ids)
        .then(function (response) {
          $scope.stations = response.data;
          $location.replace();
        });

    }
    $scope.setDecade = function (decade) {
      $scope.selectedDecade = decade;
      $location.search('slug', decade.slug);
      $location.replace();
      loadDecadeStations();
    };


  });
