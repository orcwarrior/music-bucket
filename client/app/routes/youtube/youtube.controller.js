'use strict';

angular.module('musicBucketApp')
  .controller('YoutubeCtrl', function ($scope, youtubeEntry, mbPlayerEngine) {
    $scope.ytUrl = "";

    $scope.addYTEntry = function () {
      mbPlayerEngine.getPlaylist().addEntry( new youtubeEntry($scope.ytUrl));
    };

  });
