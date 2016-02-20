'use strict';

angular.module('musicBucketApp')
  .controller('SongzaMoodCtrl', function ($scope, $location, songzaApi) {
    $scope.grouping = "mood";
    if (_.isUndefined($scope.moods))
    songzaApi.moods()
      .then(function (moods) {
        $scope.moods = moods.data.galleries;
        if ($location.search().slug) {
          $scope.selectedMood = _.find($scope.moods, function (act) {
            return act.slug === $location.search().slug;
          });
          if (!_.isUndefined($scope.selectedMood))
            loadMoodStations();
        }
      });
    function loadMoodStations() {
      $scope.stations = null;
      songzaApi.station.multi($scope.selectedMood.station_ids)
        .then(function (response) {
          $scope.stations = response.data;
          $location.replace();
        });

    }
    $scope.setMood = function (mood) {
      $scope.selectedMood = mood;
      $location.search('slug', mood.slug);
      $location.replace();
      loadMoodStations();
    };


  });
