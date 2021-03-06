'use strict';

angular.module('musicBucketApp')
  .controller('MainCtrl',
  function ($rootScope, $animate, $scope, $http, $location, socket, Auth, mbPlayerEngine, playlistLocalStorage, songCommons, playlistService, playlist, hotkeys) {
    var autoplay = $location.search().autoplay;
    var theaterMode = $location.search().theater;
    // Loading playlist from cookies:
    // TODO#2: Playlist should be FULLY recreated by LSProvider
    // TODO#3: Having this mechanics here is fuckedup
    soundManager.onready(function () {
      if (autoplay) return; // BUGFIX: When autoplay argument is active, don't load LS playlist!
      playlistLocalStorage.restoreFromLocalstorage()
        .then(function (lsPlaylist) {
          if (!lsPlaylist.err) {
            console.log("LS Playlist:");
            console.log(lsPlaylist);
            var restoredPlaylist = new playlist(lsPlaylist);
            mbPlayerEngine.setPlaylist(restoredPlaylist);
            $scope.$broadcast('playlist:update', restoredPlaylist);
          }
        })
    });

    $scope.userLoggedIn = function () {
      return Auth.isLoggedIn();
    }
    $rootScope.player = mbPlayerEngine;

    // Playlist items dropdowns:
    $scope.playlistItemDropdown = false;
    $scope.togglePlaylistItemDropdown = function ($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.status.isopen = !$scope.status.isopen;
    };
    // New track playing: (store playlist in LS)
    $scope.$on('track:id', function (event, data) {
      mbPlayerEngine.getPlaylist().storeInLocalstorage();
    });
    $scope.toggleTeatherMode = function () {
      mbPlayerEngine.theaterMode.enabled = !mbPlayerEngine.theaterMode.enabled;
      $scope.$broadcast("theater:mode", mbPlayerEngine.theaterMode.enabled);
    };

    // Initialize hotkeys:
    hotkeys.bindTo($rootScope)
      .add({
        combo: ['space', 'stop-playing'],
        description: 'Toggle playing',
        callback: _.bind(mbPlayerEngine.togglePlay, mbPlayerEngine)
      })
      .add({
        combo: ['mod+up', 'next-track'],
        description: 'Play next track',
        action: 'keydown',
        callback: _.bind(mbPlayerEngine.nextTrack, mbPlayerEngine)
      })
      .add({
        combo: ['mod+down', 'prev-track'],
        description: 'Rewind to previous track',
        action: 'keydown',
        callback: _.bind(mbPlayerEngine.prevTrack, mbPlayerEngine)
      })
      .add({
        combo: ['t'],
        description: 'Toggle Theater mode',
        action: 'keydown',
        callback: $scope.toggleTeatherMode
      });

    // User Idle in theater mode:
    $scope.$on('IdleStart', function () {
      // the user appears to have gone idle
      console.log("IDLE START!");
      if (mbPlayerEngine.theaterMode.enabled) {
        //mbPlayerEngine.theaterMode.playlistMenuToggled = false;
        mbPlayerEngine.theaterMode.userIdle = true;
      }
    });

    $scope.$on('IdleEnd', function () {
      // the user has come back from AFK and is doing stuff. if you are warning them, you can use this to hide the dialog
      $scope.$apply(function () {
        mbPlayerEngine.theaterMode.userIdle = false;
      });
      console.log("IDLE END!");
    });

    if (!_.isUndefined(theaterMode)) {
      mbPlayerEngine.theaterMode.enabled = true;
      $scope.$broadcast("theater:mode", mbPlayerEngine.theaterMode.enabled);
    }

  });
