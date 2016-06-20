'use strict';

angular.module('musicBucketApp')
  .controller('SpotifyLoginCbCtrl', function ($scope, $location, $timeout, localStorageService) {

    $scope.closeWindow = function () {
      window.close();
    };

    (function storeResponseInLocalstorage() {
      localStorageService.set('spotifyAuthTokenCode', $location.search().code);
      $scope.canBeClosed = true;
      $timeout($scope.closeWindow, 2550);
    })();

  });
