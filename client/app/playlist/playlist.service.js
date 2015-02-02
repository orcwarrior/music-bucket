'use strict';

angular.module('musicBucketEngine')
  .service('playlistService', function ($http, $q, Auth, playlistDBFactory) {
             // AngularJS will instantiate a singleton by calling "new" on this function\

             function createNewPlaylist(playlist) {
               var deferred = $q.defer();
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
             }

             function updatePlaylist(playlist) {
               var deferred = $q.defer();
               var playlistSchema = playlistDBFactory.convertTo(playlist);
               playlistSchema.author = Auth.getCurrentUser()._id;
               playlistSchema.authorName = Auth.getCurrentUser().name;
               if (_.isUndefined(playlistSchema.author)) {
                 deferred.reject("You have to be logged in to save an playlist!");
                 return deferred.promise;
               }
               $http.patch('/api/playlist/' + playlist.id, playlistSchema)
                 .success(function (response) {
                            deferred.resolve(response);
                          })
                 .error(function (error) {
                          deferred.reject(error);
                        });

               return deferred.promise;
             }

             return {
               save  : function (playlist) {
                 // Create new playlist
                 if (_.isUndefined(playlist.id)
                   || (playlist.author !== Auth.getCurrentUser()._id
                   ))
                   return createNewPlaylist(playlist);
                 // Update:
                 else
                   return updatePlaylist(playlist);
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

               }
             };
           });
