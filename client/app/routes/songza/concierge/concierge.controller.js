'use strict';

angular.module('musicBucketApp')
  .controller('SongzaConciergeCtrl', function ($scope, $q, songzaApi) {
    $scope.message = 'Hello';
    $scope.songzaDayTime = function () {
      return moment().format("dddd") + " " + songzaApi.helpers.getDayPeriod(new Date()).label;
    };

    $scope.selectedSituation = null;
    $scope.selectSituation = function (situation) {
      $scope.selectedSituation = situation;
      $scope.selectedConcreteSituation = null;
    };
    $scope.isVisibleSituation = function (situation) {
      return $scope.selectedSituation == null || $scope.selectedSituation == situation;
    }

    $scope.selectedConcreteSituation = null;
    $scope.selectConcreteSituation = function (situation) {
      $scope.selectedConcreteSituation = situation;
    };
    $scope.isVisibleConcreteSituation = function (situation) {
      return $scope.selectedConcreteSituation == null || $scope.selectedConcreteSituation == situation;
    };

    $scope.$watch('selectedConcreteSituation', function (newValue, oldValue) {
      if (newValue == null) return;

      $scope.concreteSituationsStationsInfos = [];

      var deffered = $q.defer();

      var stationsCnt = 0;
      _.each(newValue.station_ids, function (id) {
        $scope.concreteSituationsStationsInfos.push(songzaApi.helpers.createStationLoader(id))
        songzaApi.station.get(id)
          .then(function (station) {
            station = station.data;
            for (var i = 0; i < $scope.concreteSituationsStationsInfos.length; i++) {
              if ($scope.concreteSituationsStationsInfos[i].id === station.id) $scope.concreteSituationsStationsInfos[i] = station;
            }
          });
      });

      deffered.promise
        .then(function (stations) {

        });
    });
    $scope.concreteSituationsStationsInfos = [];

    // Get songza propostions:
    songzaApi.situation.targeted(5, 5)
      .then(function (concierge) {
        $scope.concierge = concierge.data
      });
  })

