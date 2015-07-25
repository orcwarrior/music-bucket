'use strict';

angular.module('musicBucketEngine')
  .service('playlistService', function ($http, $resource, $injector, $q, Auth) {
    // AngularJS will instantiate a singleton by calling "new" on this function\

    function createNewPlaylist(playlist) {
      var deferred = $q.defer();
      var playlistDBFactory = $injector.get('playlistDBFactory');
      var playlistSchema = playlistDBFactory.convertTo(playlist);
      playlistSchema.author = Auth.getCurrentUser()._id;
      playlistSchema.authorName = Auth.getCurrentUser().name;
      if (_.isUndefined(playlistSchema.author)) {
        deferred.reject("You have to be logged in to save an playlist!");
        return deferred.promise;
      }
      $http.post('/api/playlist', playlistSchema)
        .success(function (response) {
          deferred.resolve(response);
        })
        .error(function (error) {
          deferred.reject(error);
        });

      return deferred.promise;
    };

    function updatePlaylist(playlist) {
      var deferred = $q.defer();
      var playlistDBFactory = $injector.get('playlistDBFactory');
      var playlistSchema = playlistDBFactory.convertTo(playlist);
      playlistSchema.author = Auth.getCurrentUser()._id;
      playlistSchema.authorName = Auth.getCurrentUser().name;
      if (_.isUndefined(playlistSchema.author)) {
        deferred.reject("You have to be logged in to save an playlist!");
        return deferred.promise;
      }
      $http.put('/api/playlist/' + playlist.id, playlistSchema)
        .success(function (response) {
          deferred.resolve(response);
        })
        .error(function (error) {
          deferred.reject(error);
        });

      return deferred.promise;
    };
    function savePlaylist(playlist) {
      var deferred = $q.defer();
      // Create new playlist
      if (_.isUndefined(playlist.id) || (playlist.author !== Auth.getCurrentUser()._id))
        createNewPlaylist(playlist)
          .then(function (response) {
            deferred.resolve(response);
          });
      // Update:
      else {
        // Make sure there's an actual playlist:
        $http.get('/api/playlist/' + playlist.id)
          .success(function (response) {
           // there is an playlist with this id
              updatePlaylist(playlist)
                .then(function (response) {
                  deferred.resolve(response);
                })})
          /* error */
          .error(
          function(error) {
              createNewPlaylist(playlist)
                .then(function (response) {
                  deferred.resolve(response);
                });
          })
      }
      return deferred.promise;
    };

    return {
      save: function (playlist) {
        // NOTE: If playlist is based on another author playlist, reset name
        // so new user can rename it.
        if (playlist.author !== Auth.getCurrentUser()._id) {
          playlist.id = undefined; // So it will be an 'fresh' playlist
          playlist.name = '';
          playlist.author = Auth.getCurrentUser()._id;
        }

        if (playlist.name === '') playlist.settingPlaylistName = true; // it should be handled by view

        if (playlist.settingPlaylistName) {
          if (playlist.name === '') return;
          else
            playlist.settingPlaylistName = false;
        }

        savePlaylist(playlist)
          .then(function (response) {
            playlist.id = response._id;
            playlist.isAltered = false;
          });
      },
      remove: function (playlist) {
        var user = Auth.getCurrentUser();
        if (user._id !== playlist.author) throw new Error("User is not an author of playlist");

        var deferred = $q.defer();
        $http.delete('/api/playlist/' + playlist._id)
          .success(function (response) {
            deferred.resolve(response);
          })
          .error(function (error) {
            deferred.reject(error);
          });
        return deferred.promise;
      },
      query: function () {
        return $http.get('/api/playlist');
      },
      get: function (playlistId) {
        return $http.get('/api/playlist/' + playlistId);
      },
      advanceTimer: function (playlistId) {
        return $http.post('/api/playlist/' + playlistId + '/advanceTimer', {});
      }
    };
  });
