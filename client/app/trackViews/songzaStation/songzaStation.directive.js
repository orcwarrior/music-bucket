'use strict';

angular.module('musicBucketApp')
  .directive('songzaStation', function ($mdDialog, mbPlayerEngine, songzaEntryBuilder) {
    return {
      templateUrl: 'app/trackViews/songzaStation/songzaStation.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        scope.addToPlaylist = function (station) {
          var stationEntry = songzaEntryBuilder.build(station)
            .then(function(stationEntry) {
              mbPlayerEngine.addToPlaylist(stationEntry);
            });
        };
        scope.moreInfos = function (ev) {
          $mdDialog.show({
            controller: 'SongzaStationDialogController',
            templateUrl: 'app/templates/songzaStation.view.template.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            locals: {
              'entry': scope.station
            }
          });
        };
      }
    };
  });
