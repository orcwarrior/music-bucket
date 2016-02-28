/**
 * Created by orcwarrior on 2015-01-20.
 */
(function () {
  angular.module('musicBucketEngine')
    .factory('playlistLocalStorage', function ($q, modelConverter, localStorageService) {

      const localStorageVersion = "0.2.1";
      // WEAK AS FUCK, REFACTOR LATER!

      return {
        restoreFromLocalstorage: function () {
          var deffered = $q.defer();
          var lsPlaylist = localStorageService.get('playlist');
          if (_.isNull(lsPlaylist)) {
            deffered.reject({err: "There is no localStorage playlists."});
            return deffered.promise;
          }

          if (lsPlaylist.version !== localStorageVersion) {
            localStorageService.remove('playlist');
            alert("There was local storage version update, all unsaved playlist changes will be lost!");
            deffered.reject({err: "There was local storage version update, all unsaved playlist changes will be lost!"});
            deffered.reject({err: "There was local storage version update, all unsaved playlist changes will be lost!"});
            return deffered.promise;
          }
          modelConverter.convertFromModel(lsPlaylist, 'cookies')
            .then(function (lsPlaylist) {
              console.log("Converted playlist:");
              console.log(lsPlaylist);
              lsPlaylist.version = localStorageVersion;
              return deffered.resolve(lsPlaylist);
            });
          return deffered.promise;
        },
        storeInLocalstorage: function () {
          localStorageService.remove('playlist');
          modelConverter.convertToModel(this, 'cookies')
            .then(function (lsPlaylist) {
              console.log("Converted playlist:");
              console.log(lsPlaylist);
              lsPlaylist.version = localStorageVersion;
              localStorageService.set('playlist', JSON.stringify(lsPlaylist));
            });
        }
      }
    })
})();
