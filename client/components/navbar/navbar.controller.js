'use strict';

angular.module('musicBucketApp')
  .controller('NavbarCtrl', function ($scope, $location, Auth, hotkeys) {
    $scope.menu = [{
      'title': 'Home',
      'link': '/'
    },
      {
        'title': 'Playlists',
        'link': '/playlists'
      },
      {
        'title': 'Discover',
        'link': '/discover'
      },
      {
        'title': 'Ideas',
        'link': '/ideas'
      }];

    $scope.isCollapsed = true;
    $scope.isLoggedIn = Auth.isLoggedIn;
    $scope.isAdmin = Auth.isAdmin;
    $scope.getCurrentUser = Auth.getCurrentUser;

    $scope.logout = function () {
      Auth.logout();
      $location.path('/login');
    };

    $scope.isActive = function (route) {
      return route === $location.path();
    };
    $scope.isJulek = function () {
      return navigator.userAgent.indexOf('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) Apple') !== -1;
    };

    $scope.$watch('player.theaterMode.userIdle', function () {
    });
    $scope.showCheatSheet = function () {
      hotkeys.toggleCheatSheet();
    };
  });
