'use strict';

angular.module('musicBucketApp')
  .controller('LocalCtrl', function ($scope, $rootScope, song, songCommons, localEntry, angularPlayer) {

    $scope.$watch("droppedFiles",
      function (val, oldVal, scope) {
        if (_.isUndefined(val)) return;
        var songs = [], localSongEntries = [];
        $rootScope.playlist = $rootScope.playlist || [];
        for (var i = 0; i < $scope.droppedFiles.length; i++) {
          songs[i] = new song($scope.droppedFiles[i], songCommons.songType.local);
          localSongEntries[i] = new localEntry.constructor(songs[i]);
          angularPlayer.addToPlaylist(localSongEntries[i]);
        }
      });
  });
