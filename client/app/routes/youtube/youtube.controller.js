'use strict';

angular.module('musicBucketApp')
  .controller('YoutubeCtrl', function ($scope, youtubeEntry, mbPlayerEngine) {
    $scope.ytUrl = "https://www.youtube.com/watch?v=hZvFGEE26vE";

    $scope.addYTEntry = function () {
      mbPlayerEngine.getPlaylist().addEntry( new youtubeEntry($scope.ytUrl));
    };

  });
