'use strict';

angular.module('musicBucketEngine')
  .service('playlistService', function ($http, $q, Auth) {
    // AngularJS will instantiate a singleton by calling "new" on this function
             function convertPlaylistToSchemeModel(deferred, playlist) {
               Auth.isLoggedInAsync(function(logged){
                 if (!logged) {
                   deferred.reject(new Error('Guests cannot store playlists'));
                   return;
                 }

                 return {
                   name : playlist.name,
                   entries : playlist.entries,
                   songsCount : playlist.songsCount};
                 playlistScheme.author = Auth.getCurrentUser();
               })
             }

             return {
               save : function(playlist) {
                 var deferred = $q.defer();
                 playlist = convertPlaylistToSchemeModel(deferred, playlist);

                 // TODO: Update if id is present
                 $http.post('/api/playlist', playlist)
                   .success(function(response) {
                        deferred.resolve(response);
                   })
                   .fail(function(error) {
                        deferred.reject(error);
                   });
                 return deferred.promise;
               }
             };
  });
