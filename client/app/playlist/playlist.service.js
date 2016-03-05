'use strict';

angular.module('musicBucketEngine')
  .service('playlistService', function ($http, $resource, $injector, $q, Auth, modelConverter) {
    // AngularJS will instantiate a singleton by calling "new" on this function\

    function _createNewPlaylist(playlist) {
      var deferred = $q.defer();
      modelConverter.convertToModel(playlist, 'db')
        .then(function (dbModel) {
          console.log(dbModel);
          dbModel.author = Auth.getCurrentUser()._id;
          dbModel.authorName = Auth.getCurrentUser().name;
          if (_.isUndefined(dbModel.author)) {
            deferred.reject("You have to be logged in to save an playlist!");
            return deferred.promise;
          }
          $http.post('/api/playlist', dbModel)
            .success(function (response) {
              deferred.resolve(response);
            })
            .error(function (error) {
              deferred.reject(error);
            });
        });
      return deferred.promise;
    }

    function _updatePlaylist(playlist) {
      var deferred = $q.defer();
      modelConverter.convertToModel(playlist, 'db')
        .then(function (dbPlaylist) {
          dbPlaylist.author = Auth.getCurrentUser()._id;
          dbPlaylist.authorName = Auth.getCurrentUser().name;
          if (_.isUndefined(dbPlaylist.author)) {
            deferred.reject("You have to be logged in to save an playlist!");
            return deferred.promise;
          }
          $http.put('/api/playlist/' + playlist.id, dbPlaylist)
            .success(function (response) {
              deferred.resolve(response);
            })
            .error(function (error) {
              deferred.reject(error);
            });
        });
      return deferred.promise;
    }

    function _loadPlaylist(dbPlaylist) {
      var deferred = $q.defer();
      modelConverter.convertFromModel(dbPlaylist, 'db')
        .then(function (playlist) {
          deferred.resolve(playlist);
        });
      return deferred.promise;
    }

    function savePlaylist(playlist) {
      var deferred = $q.defer();
      // Create new playlist
      if (_.isUndefined(playlist.id) || (playlist.author !== Auth.getCurrentUser()._id))
        _createNewPlaylist(playlist)
          .then(function (response) {
            deferred.resolve(response);
          });
      // Update:
      else {
        // Make sure there's an actual playlist:
        $http.get('/api/playlist/' + playlist.id)
          .success(function (response) {
            // there is an playlist with this id
            _updatePlaylist(playlist)
              .then(function (response) {
                deferred.resolve(response);
              })
          })
          /* error */
          .error(
          function (error) {
            _createNewPlaylist(playlist)
              .then(function (response) {
                deferred.resolve(response);
              });
          })
      }
      return deferred.promise;
    }

    return {
      save: function (playlist) {
        // NOTE: If playlist is based on another author playlist, reset name
        // so new user can rename it.
        if (playlist.author !== Auth.getCurrentUser()._id) {
          playlist.id = undefined; // So it will be an 'fresh' playlist
          //playlist.name = '';
          playlist.author = Auth.getCurrentUser()._id;
        }

        savePlaylist(playlist)
          .then(function (response) {
            playlist.id = response._id;
            playlist.isAltered = false;
          });
      },
      load: function (playlist) {
        return _loadPlaylist(playlist);
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
        if (!_.isUndefined(playlistId))
          return $http.post('/api/playlist/' + playlistId + '/advanceTimer', {});
      },
      isPlaylistOwner: function (playlist) {
        var curId = Auth.getCurrentUser()._id;
        return (playlist.author === curId);
      }
    };
  });
