/**
 * Created by orcwarrior on 2015-07-23.
 */

angular.module('musicBucketApp')
  .controller('SongzaStationDialogController', function ($mdDialog, $scope, entry, songzaStationEntry, mbPlayerEngine) {

    $scope.station = entry;
    $scope.doAction = function (action) {
      var stationEntry = new songzaStationEntry($scope.station);
      mbPlayerEngine.addToPlaylist(stationEntry);
      switch (action) {
        case "add":
          break;
        case "play":
          mbPlayerEngine.entryPlay(stationEntry);
          break;
        case "play-next":
          mbPlayerEngine.entryPlayNext(stationEntry);
          break;
        case "queue":
          mbPlayerEngine.entryEnqueue(stationEntry);
          break;
      }
      ;
      $scope.cancel();
    }
    $scope.hide = function () {
      $mdDialog.hide();
    };
    $scope.cancel = function () {
      $mdDialog.cancel();
    };
    $scope.answer = function (answer) {
      // if (answer === 'save')
      //    playlistService.save($scope.playlist);
      $mdDialog.hide(answer);
    };
  });
