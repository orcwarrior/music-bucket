'use strict';

angular.module('musicBucketApp')
  .controller('LocalCtrl', function ($scope, $rootScope, song, songCommons, localEntry, angularPlayer) {
    $scope.loadProgress = 0;
    $scope.loadingFiles = false;

    $scope.$watch("droppedFiles",
      function (val, oldVal, scope) {
        if (_.isUndefined(val)) return;
        var songs = [], localSongEntries = [];
        $scope.loadingFiles = true;
        for (var i = 0; i < $scope.droppedFiles.length; i++) {
          songs[i] = new song($scope.droppedFiles[i], songCommons.songType.local);
          localSongEntries[i] = new localEntry(songs[i]);
          angularPlayer.addToPlaylist(localSongEntries[i]);

          if (i%5 === 0)
            $scope.$apply( function() {
              $scope.loadProgress = ((i / $scope.droppedFiles.length) * 1);
              $scope.$broadcast('playerProgressbar:update', $scope.loadProgress);
              console.log("Progress: "+$scope.loadProgress);
            });
        };
        $scope.loadProgress = 1;
        $scope.loadingFiles = false;
      });
  });
