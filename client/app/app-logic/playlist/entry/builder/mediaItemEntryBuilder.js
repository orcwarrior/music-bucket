/**
 * Created by orcwa on 15.11.2015.
 */

(function () {
  angular.module('musicBucketEngine')
    .factory('mediaItemEntryBuilder', function ($q, $injector, mediaItemBuilder, entryCommons, virtualEntry, songMetainfos, songUnresolved, entryBuilder) {

      function getPlayOrderBasedOnMediaType(type) {
        return entryCommons.nextOrder.random;
      }

      function defaultMediaItemEntryBuild(mediaItem) {
        var entry = new virtualEntry(mediaItem.name, undefined, mediaItem._suggestedSequencer || entryCommons.nextOrder.random);
        _.each(mediaItem.tracks, function (track) {
          entry.addSong(new songUnresolved(new songMetainfos(track)
            /*,resolveFunction (use default)*/
          ));
        });
        return entry;
      }

      var mediaItemEntryBuilderFunc = function mediaItemEntryBuilder() {
        this.build = function (mediaItem, restoredObj) {
          var defferedEntry = $q.defer();
          // if (mediaItem.__builder__.name === "...")
          // new mediaItemRestorer(mediaItem); ???
          //  then (...)
          // Generate builderInfos on first build ???
          if (mediaItem._isBuilderObj) mediaItem = mediaItemBuilder(mediaItem);
          mediaItem._resolvePlaylist()
            .then(function (fullMediaItem) {
              var mediaItemEntry = (fullMediaItem.__playlistEntryCreatorMethod) ?
                fullMediaItem.__playlistEntryCreatorMethod() : defaultMediaItemEntryBuild(fullMediaItem);

              if (restoredObj)
                _.deepExtend(mediaItemEntry, restoredObj);
              // TODO: setup builder (lookat songza, fix mediaitem - add needed methods)
              mediaItemEntry.__builder__ = fullMediaItem._getBuilderObj();
              defferedEntry.resolve(mediaItemEntry);
        });
          return defferedEntry.promise;
        };
      };
      mediaItemEntryBuilderFunc.prototype = entryBuilder;

      return new mediaItemEntryBuilderFunc();
    });
})();
