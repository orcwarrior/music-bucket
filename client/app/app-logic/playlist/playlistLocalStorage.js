/**
 * Created by orcwarrior on 2015-01-20.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('playlistLocalStorage', function (playlistCookieFactory, localStorageService) {


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
                     console.log("RESTORED FROM LS");
                     console.log(lsPlaylist);
                     return lsPlaylist;
                   },
                   storeInLocalstorage : function () {
                     storeInLocalstorage(this);
                     console.log('STORED IN LS:');
                     console.log(playlistCookieFactory.convertTo(this));
                   }
                }
               })
  })();
