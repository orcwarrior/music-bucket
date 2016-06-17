'use strict';

angular.module('musicBucketApp')
  .controller('SongzaConciergeCtrl', function ($scope, $q, songzaApi) {
    $scope.message = 'Hello';
    $scope.songzaDayTime = function () {
      return moment().format("dddd") + " " + songzaApi.helpers.getDayPeriod(new Date()).label;
    };

    $scope.selectedSituation = null;
    $scope.selectSituation = function (situation) {
      if (situation.stations.length) {
        $scope.selectedSituation = null;
        $scope.selectConcreteSituation(situation);
      } else {
        $scope.selectedSituation = situation;
        $scope.selectedConcreteSituation = null;
      }
    };
    $scope.isVisibleSituation = function (situation) {
      return $scope.selectedSituation == null || $scope.selectedSituation == situation || $scope.selectConcreteSituation == situation;
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

      songzaApi.station.multi(newValue.stations)
        .then(function(response) {
          $scope.concreteSituationsStationsInfos = response.data;
        });
    });
    $scope.concreteSituationsStationsInfos = [];

    // Get songza propostions:
    songzaApi.situation.targeted(5, 5)
      .then(function (concierge) {
        $scope.concierge = concierge.data
      });
  })

