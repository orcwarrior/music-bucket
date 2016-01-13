/**
 * Created by orcwarrior on 2015-01-20.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('playlistLocalStorage', function (playlistCookieFactory, localStorageService) {

                // WEAK AS FUCK, REFACTOR LATER!
                 function storeInLocalstorage(playlist) {
                   localStorageService.clearAll();
                   localStorageService.set('playlist', JSON.stringify(playlistCookieFactory.convertTo(playlist)));
                 }

                 function restoreFromLocalstorage() {
                   var lsPlaylist = localStorageService.get('playlist');
                   if (_.isNull(lsPlaylist)) return null;

                   var playlist = playlistCookieFactory.convertFrom(lsPlaylist);
                   return playlist;
                 }

                 return {
                   restoreFromLocalstorage : function () {
                     var lsPlaylist = restoreFromLocalstorage();
                     return lsPlaylist;
                   },
                   storeInLocalstorage : function () {
                     storeInLocalstorage(this);
                     //storeInLocalstorage(this);
                   }
                }
               })
  })();
