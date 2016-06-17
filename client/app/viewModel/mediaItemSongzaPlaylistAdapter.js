/**
 * Created by orcwa on 29.05.2016.
 */

angular.module('musicBucketEngine')
  .factory('mediaItemSongzaPlaylistAdapter', function ($q, mediaItem, mediaItemTypes, songzaApi) {

    var resolveTracks = function () {
      var deffered = $q.defer();
      if (_.contains(this.__resolvedSections, this.__sectionNames.tracks)) {
        console.warn("mediaItem part already resolved!");
        deffered.resolve(this);
        return deffered.promise;
      }

      var slfMediaItem = this;
      this._isLoading = true;
      songzaApi.station.get(this.__SongzaPlaylistId)
        .then(function (station) {
          station = station.data;
          // BUGFIX: Fully reinitialize (builder make some fields empty
          _.extendOwn(slfMediaItem, new mediaItemSongzaPlaylistAdapterFunc(station), slfMediaItem);

          slfMediaItem.tracks = _.map(station.songs, function (track) {
            return {
              artist: track.artist,
              album: track.album,
              albumArt: undefined, // TODO: getAlbumCover from some service
              title: track.title,
              trackNo: undefined,
              duration: track.duration * 1000 // to ms
            };
          });
          slfMediaItem.__resolvedSections = slfMediaItem.__resolvedSections.concat([
            slfMediaItem.__sectionNames.metainfos,
            slfMediaItem.__sectionNames.tracks
          ]);
          slfMediaItem._isLoading = false;
          deffered.resolve(slfMediaItem);
        });

      return deffered.promise;
    };

    function getBuilderObj() {
      var builderObj = _.pick(this, 'type', '__SongzaPlaylistId');
      builderObj._isBuilderObj = true;
      return {name: 'mediaItemEntryBuilder', data: builderObj};
    }

    function noopResolve() {
      var d = $q.defer();
      d.resolve(this);
      return d.promise;
    }

    var mediaItemSongzaPlaylistAdapterFunc = function mediaItemSongzaPlaylistAdapter(SongzaPlaylist) {
      if (SongzaPlaylist._isBuilderObj) {
        _.extendOwn(this, new mediaItem(SongzaPlaylist.__SongzaPlaylistId));
        _.extendOwn(this, SongzaPlaylist);
        this._isBuilderObj = false;
      }
      else { /* regular spotify playlist */
        _.extendOwn(this, new mediaItem(
          SongzaPlaylist._id,
          SongzaPlaylist.name,
          SongzaPlaylist.cover,
          SongzaPlaylist.songsCount,
          undefined
        ));
        this.type = mediaItemTypes.songzaPlaylist;
        if (!this.__SongzaPlaylistId)
          this.__SongzaPlaylistId = SongzaPlaylist._id;
      }
      this.author = SongzaPlaylist.creator;
      this.description = SongzaPlaylist.description;
      this._resolveMetainfos = noopResolve;
      this._resolvePlaylist = resolveTracks;
      this._getBuilderObj = getBuilderObj;
      return this;
    }
    return mediaItemSongzaPlaylistAdapterFunc;
  });
