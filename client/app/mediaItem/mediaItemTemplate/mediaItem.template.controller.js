/**
 * Created by orcwarrior on 2015-07-23.
 */

angular.module('musicBucketApp')
  .controller('mediaItemController', function ($q, $mdDialog, $scope, item, mbPlayerEngine, mediaItemEntryBuilder) {

    $scope.item = item;
    item._resolveMetainfos(); // load rest of playlist data.

    $scope.doAction = function (action) {
      var mediaItemEntry = mediaItemEntryBuilder.build($scope.item);
      $q.when(mediaItemEntry, function (buildedEntry) {
        if (mbPlayerEngine.getPlaylist().findEntry(buildedEntry) != buildedEntry)
          mbPlayerEngine.addToPlaylist(buildedEntry);
        var miId = $scope.item.id;
        switch (action) {
          case "add":
            break;
          case "play":
            mbPlayerEngine.entryPlay(buildedEntry, miId);
            break;
          case "play-next":
            mbPlayerEngine.entryPlayNext(buildedEntry, miId);
            break;
          case "queue":
            mbPlayerEngine.entryEnqueue(buildedEntry, miId);
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
