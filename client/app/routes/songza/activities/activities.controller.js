'use strict';

angular.module('musicBucketApp')
  .controller('SongzaActivitiesCtrl', function ($scope, $location, songzaApi) {
    $scope.grouping = "activity";
    if (_.isUndefined($scope.activities))
      songzaApi.activities()
        .then(function (activities) {
          $scope.activities = activities.data;
          if ($location.search().slug) {
            $scope.selectedActivity = _.find($scope.activities, function (act) {
              return act.slug === $location.search().slug;
            });
            if (!_.isUndefined($scope.selectedActivity))
              loadActivityStations();
          }
        });
    function loadActivityStations() {
      $scope.stations = null;
      songzaApi.station.multi($scope.selectedActivity.stations)
        .then(function (response) {
          $scope.stations = response.data;
          $location.replace();
        });

    }

    $scope.setActivity = function (activity) {
      $scope.selectedActivity = activity;
      $location.search('slug', activity.slug);
      $location.replace();
      loadActivityStations();
    };
  });
