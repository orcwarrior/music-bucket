/**
 * Created by orcwarrior on 2015-07-23.
 */

angular.module('musicBucketApp')
  .controller('YTEntryDialogController', function ($mdDialog, $scope, entry, mbPlayerEngine, youtubeEntryBuilder) {

    $scope.entry = entry;
    function getId(id) {
      if (id.kind === "youtube#video")
        return id.videoId;
      else if (id.kind === "youtube#playlist")
        return id.playlistId;
    }

    $scope.doAction = function (action) {
      var ytEntry = new youtubeEntryBuilder($scope.entry.id);
      mbPlayerEngine.addToPlaylist(ytEntry);
      var ytId = getId($scope.entry.id);
      switch (action) {
        case "add":
          break;
        case "play":
          mbPlayerEngine.entryPlay(ytEntry, ytId);
          break;
        case "play-next":
          mbPlayerEngine.entryPlayNext(ytEntry, ytId);
          break;
        case "queue":
          mbPlayerEngine.entryEnqueue(ytEntry, ytId);
          break;
      }
      ;
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
