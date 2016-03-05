/**
 * Created by orcwa on 15.11.2015.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('albumEntryBuilder', function ($q, $injector, entryCommons, virtualEntry, songMetainfos, songUnresolved, entryBuilder) {
      function pickNeededAlbumInfos(albumInfos) {
        var pickedInfos = {};
        pickedInfos = _.pick(albumInfos, ['artist', 'name', 'albumArt']);
        pickedInfos.tracks = _.map(albumInfos.tracks, function (track) {
          return {name: track.name, trackNo: track.index || track.trackNo};
        });
        return pickedInfos;
      }

      var albumEntryBuilderFunc = function albumEntryBuilder() {
        this.build = function (albumInfos, restoredObj) {
          albumInfos.artist = (albumInfos.artist || albumInfos.__artistName);
          var builderInfos = pickNeededAlbumInfos(albumInfos);
          var albumEntry = new virtualEntry(builderInfos.artist + "-" + builderInfos.name, undefined, entryCommons.nextOrder.sequence);
          _.each(builderInfos.tracks, function (track) {
            albumEntry.addSong(new songUnresolved(
              new songMetainfos({
                artist: builderInfos.artist,
                album: builderInfos.name,
                albumArt: builderInfos.albumArt,
                title: track.name,
                trackNo: track.trackNo,
                duration: track.duration
              })
              /*,resolveFunction (use default)*/
            ));
          });
          if (restoredObj)
            _.deepExtend(albumEntry, restoredObj);
          // setup builder
          albumEntry.__builder__ = {name: 'albumEntryBuilder', data: builderInfos};
          return albumEntry;
        };
      };
      albumEntryBuilderFunc.prototype = entryBuilder;

      return new albumEntryBuilderFunc();
    });
})();
