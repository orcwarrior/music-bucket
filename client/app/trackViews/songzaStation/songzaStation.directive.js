'use strict';

angular.module('musicBucketApp')
  .directive('songzaStation', function (mbPlayerEngine, songzaStationEntry) {
    return {
      templateUrl: 'app/trackViews/songzaStation/songzaStation.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        scope.addToPlaylist = function (station) {
          var stationEntry = new songzaStationEntry(station);
          mbPlayerEngine.addToPlaylist(stationEntry);
        }
      }
    };
  });
