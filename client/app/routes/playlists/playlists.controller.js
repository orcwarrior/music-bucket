'use strict';

angular.module('musicBucketApp')
  .controller('PlaylistsCtrl', function ($scope, $log, $http, $location, $mdDialog, mbPlayerEngine, Auth, playlistService) {

    var selectedPlaylistId = $location.search().id;
    var autoplay = $location.search().autoplay;
    var theaterMode = $location.search().theater;
    var pickedPlaylist;


    function _prepareSelectedPlaylist() {
      if (_.isUndefined(pickedPlaylist)) return;
      mbPlayerEngine.theaterMode.enabled = !_.isUndefined(theaterMode);
      pickedPlaylist.id = pickedPlaylist._id;
      $scope.loadPlaylist(pickedPlaylist);
      if (autoplay) {
        mbPlayerEngine.clearQueue();
        mbPlayerEngine.play();
      }
    }

    function _getSelectedPlaylist() {
      if (!_.isUndefined(selectedPlaylistId)) {
        $log.info("selected playlist: " + selectedPlaylistId);
        pickedPlaylist = _.find($scope.playlists, function (playlist) {
          return (playlist._id == selectedPlaylistId);
        });
        $log.info("picked playlist: " + pickedPlaylist);
        if (_.isUndefined(pickedPlaylist)) {
          $log.info("Playlist private, or not exist, checking" + pickedPlaylist);
          playlistService.get(selectedPlaylistId)
            .then(function (response) {
              pickedPlaylist = response.data;
              $log.info("..playlist received: " + pickedPlaylist);
              _prepareSelectedPlaylist();
            });
        } else
          _prepareSelectedPlaylist();
      }
    }

    function _categorizePlaylists(playlists) {
      var categorized = {'private': [], 'public': []};
      _.each(playlists, function (playlist) {
        categorized[playlist.visibility || 'public'].push(playlist);
      });
      return categorized;
    }

    function getPlaylists() {
      playlistService.query()
        .then(function (response) {
          $scope.playlists = response.data;
          _getSelectedPlaylist();
          $scope.playlists = _categorizePlaylists($scope.playlists);
        });
    }

    getPlaylists();

    $scope.loadPlaylist = function (playlist) {
      mbPlayerEngine.setIsWorking(true);
      var loadedPlaylist = playlistService.load(playlist);
      loadedPlaylist.then(function(playlist) {
        playlist.storeInLocalstorage();
        mbPlayerEngine.setPlaylist(playlist);
        mbPlayerEngine.setIsWorking(false);
      });
    };
    $scope.isPlaylistOwner = function (playlist) {
      var curId = Auth.getCurrentUser()._id;
      return (playlist.author === curId);
    };
    $scope.deletePlaylist = function (playlist) {
      // TODO: On playlist remove error, show some msg
      var result = playlistService.remove(playlist);
      getPlaylists();
    }

    $scope.moreInfosAboutPlaylist = function (event, playlist) {
      $mdDialog.show({
        controller: 'PlaylistSaveDialogController',
        templateUrl: 'app/templates/playlist.view.template.html',
        parent: angular.element(document.body),
        targetEvent: event,
        locals: {
          'playlist': playlist
        },
      });
    }
    /* TODO: REFACTOR THIS SHIT */
    $scope.showDialogShare = function ($event, playlist) {
      var parentEl = angular.element(document.body);
      $mdDialog.show({
        parent: parentEl,
        targetEvent: $event,
        template: '<md-dialog aria-label="Share playlist" style="width: 620px; max-width:100%; padding: 0px 0 0 16px">' +
        '  <md-dialog-content>' +
        '    <h2>Share Playlist</h2>' +
        '    <md-input-container style=" margin-right: 16px;">' +
        '      <label>URL</label>' +
        '      <input id="playlistShareUrl" ng-model="url" auto-select="">' +
        '    </md-input-container>' +
        '  </md-dialog-content>' +
        '  <fieldset class="standard">' +
        '    <legend>Options</legend>' +
        '    <div layout="row" layout-wrap>' +
        '      <div flex="50">' +
        '        <md-checkbox ng-model="autoplay"' +
        '          ng-change="buildUrl()"' +
        '          ng-true-value="\'autoplay\'"' +
        '          ng-false-value="\'\'"' +
        '          class="md-primary"' +
        '          aria-label="autoplay">' +
        '          Autoplay' +
        '        </md-checkbox>' +
        '      </div>' +
        '      <div flex="50">' +
        '        <md-checkbox' +
        '          ng-model="theater"' +
        '          ng-change="buildUrl()"' +
        '          aria-label="Theater mode"' +
        '          ng-true-value="\'theater\'"' +
        '          ng-false-value="\'\'"' +
        '          class="md-primary">' +
        '          Theater Mode' +
        '        </md-checkbox>' +
        '      </div>' +
        '  </fieldset>' +
        '  <div class="md-actions">' +
        '    <md-button ng-click="closeDialog()">' +
        '     Ok' +
        '    </md-button>' +
        '</div>' +
        '</md-dialog>',
        locals: {
          playlistId: function () { return playlist._id; }()
        },
        controller: 'DialogShareController',
      });
    }

  })
  .
  controller('DialogShareController', function DialogShareController($scope, $mdDialog, playlistId) {
    $scope.pId = playlistId;
    $scope.baseUrl = window.location.host + window.location.pathname;
    $scope.buildUrl = function () {
      $scope.url = $scope.baseUrl + "?id=" + $scope.pId;
      if ($scope.autoplay) $scope.url += "&" + $scope.autoplay;
      if ($scope.theater) $scope.url += "&" + $scope.theater;
    }
    $scope.buildUrl();
    setTimeout(function () {
      var inputEl = angular.element(document.querySelector('#playlistShareUrl'));
      inputEl[0].focus();
      inputEl[0].select();
    }, 500);

    $scope.closeDialog = function () {
      $mdDialog.hide();
    }
  });
