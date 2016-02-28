/**
 * Created by orcwarrior on 2015-07-23.
 */

angular.module('musicBucketApp')
  .controller('YTEntryDialogController', function ($q, $mdDialog, $scope, entry, mbPlayerEngine, youtubeEntryBuilder) {

    $scope.entry = entry;
    function getId(id) {
      if (id.kind === "youtube#video")
        return id.videoId;
      else if (id.kind === "youtube#playlist")
        return id.playlistId;
    }

    $scope.doAction = function (action) {
      var ytEntry = youtubeEntryBuilder.build($scope.entry.id);
      $q.when(ytEntry, function (buildedEntry) {
        if (mbPlayerEngine.getPlaylist().findEntry(buildedEntry) != buildedEntry)
          mbPlayerEngine.addToPlaylist(buildedEntry);
        var ytId = getId($scope.entry.id);
        switch (action) {
          case "add":
            break;
          case "play":
            mbPlayerEngine.entryPlay(buildedEntry, ytId);
            break;
          case "play-next":
            mbPlayerEngine.entryPlayNext(buildedEntry, ytId);
            break;
          case "queue":
            mbPlayerEngine.entryEnqueue(buildedEntry, ytId);
            break;
        }
        mbPlayerEngine.getPlaylist().alter();
      });
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
