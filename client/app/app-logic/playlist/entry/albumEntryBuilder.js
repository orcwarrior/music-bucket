/**
 * Created by orcwa on 15.11.2015.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('albumEntryBuilder', function ($q, entryCommons, virtualEntry, songMetainfos, songUnresolved) {
      return function albumEntryBuilder(albumInfos) {
        var albumEntry = new virtualEntry((albumInfos.artist || albumInfos.__artistName) + " - " + albumInfos.name, undefined, entryCommons.nextOrder.sequence);
        _.each(albumInfos.tracks, function (track) {
          albumEntry.addSong(new songUnresolved(
            new songMetainfos({artist: albumInfos.artist || albumInfos.__artistName,
                album: albumInfos.name,
                albumArt: albumInfos.albumArt,
                title: track.name})
            /*,resolveFunction (use default)*/
          ));
        });
        return albumEntry;
      };
    });
})();
