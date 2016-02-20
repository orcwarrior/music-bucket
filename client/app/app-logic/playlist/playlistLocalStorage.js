/**
 * Created by orcwarrior on 2015-01-20.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('playlistLocalStorage', function (playlistCookieFactory, localStorageService) {

                const localStorageVersion = "0.1.4";
                // WEAK AS FUCK, REFACTOR LATER!
                 function storeInLocalstorage(playlist) {
                   localStorageService.remove('playlist');
                   var lsPlaylist = playlistCookieFactory.convertTo(playlist)
                   lsPlaylist.version = localStorageVersion;
                   localStorageService.set('playlist', JSON.stringify(lsPlaylist));
                 }

                 function restoreFromLocalstorage() {
                   var lsPlaylist = localStorageService.get('playlist');
                   if (_.isNull(lsPlaylist)) return null;
                   if (lsPlaylist.version !== localStorageVersion) {
                     localStorageService.remove('playlist');
                     alert("There was local storage version update, all unsaved playlist changes will be lost!");
                     return null;
                   }

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
