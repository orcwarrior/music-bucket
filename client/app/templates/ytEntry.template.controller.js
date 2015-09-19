/**
 * Created by orcwarrior on 2015-07-23.
 */

angular.module('musicBucketApp')
  .controller('YTEntryDialogController', function ($mdDialog, $scope, entry, mbPlayerEngine, youtubeEntry) {

    $scope.entry = entry;
    $scope.doAction = function (action) {
      var ytEntry = new youtubeEntry($scope.entry.id);
      mbPlayerEngine.addToPlaylist(ytEntry);
      switch (action) {
        case "add":
          break;
        case "play":
          mbPlayerEngine.entryPlay(ytEntry);
          break;
        case "play-next":
          mbPlayerEngine.entryPlayNext(ytEntry);
          break;
        case "queue":
          mbPlayerEngine.entryEnqueue(ytEntry);
          break;
      };
      $scope.cancel();
    };
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
