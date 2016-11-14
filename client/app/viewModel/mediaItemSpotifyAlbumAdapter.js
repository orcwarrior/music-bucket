/**
 * Created by orcwa on 29.05.2016.
 */

angular.module('musicBucketEngine')
  .factory('mediaItemSpotifyAlbumAdapter', function ($q, mediaItem, mediaItemTypes, spotifyApi, entryCommons) {

    var resolveMetainfosProto = function () {
      var deffered = $q.defer();
      if (_.contains(this.__resolvedSections, this.__sectionNames.metainfos)) {
        console.warn("mediaItem part already resolved!");
        deffered.resolve(this);
        return deffered.promise;
      }

      var slfMediaItem = this;
      this._isLoading = true;
      spotifyApi.albums.get(this.__SpotifyAlbumId)
        .then(function (response) {
          // BUGFIX: Fully reinitialize (builder make some fields empty
          _.extendOwn(slfMediaItem, new mediaItemSpotifyAlbumAdapterFunc(response.data), slfMediaItem);

          slfMediaItem.description = null;
          var release = moment(response.data.release_date, "YYYY-MM-DD");
          slfMediaItem.dateReleased = release.format("LL");
          slfMediaItem.artist = response.data.artists[0].name;

          //slfMediaItem.author = slfMediaItem.artist;
          slfMediaItem.tags = response.data.generes;
          // TODO: Grab if there is more than 100 items (exclude to new function)
          slfMediaItem.tracks = _.map(response.data.tracks.items, function (track) {
            return {
              artist: track.artists[0].name,
              album: slfMediaItem.name,
              albumArt: slfMediaItem.cover,
              title: track.name,
              trackNo: track.track_number,
              duration: track.duration_ms
            };
          });
          // TODO: Description!

          slfMediaItem.length = _.reduce(slfMediaItem.tracks, function (memo, track) {
            return memo + track.duration;
          }, 0);
          slfMediaItem.description = _.reduce(slfMediaItem.tracks, function (memo, track) {
            return memo + track.trackNo + ". " + track.title + "<br/>";
          }, "");
          slfMediaItem.songsCount = slfMediaItem.tracks.length;

          slfMediaItem.__resolvedSections = slfMediaItem.__resolvedSections.concat([
            slfMediaItem.__sectionNames.metainfos,
            slfMediaItem.__sectionNames.tracks
          ]);
          slfMediaItem._isLoading = false;
          deffered.resolve(slfMediaItem);
        });

      return deffered.promise;
    }

    function getBuilderObj() {
      var builderObj = _.pick(this, 'type', '__SpotifyAlbumId');
      builderObj._isBuilderObj = true;
      return {name: 'mediaItemEntryBuilder', data: builderObj};
    }

    var mediaItemSpotifyAlbumAdapterFunc = function mediaItemSpotifyAlbumAdapter(SpotifyAlbum) {
      if (SpotifyAlbum._isBuilderObj) {
        _.extendOwn(this, new mediaItem(SpotifyAlbum.__SpotifyAlbumId));
        _.extendOwn(this, SpotifyAlbum);
        this._isBuilderObj = false;
      }
      else { /* regular spotify playlist */
        _.extendOwn(this, new mediaItem(
          SpotifyAlbum.id,
          SpotifyAlbum.name,
          SpotifyAlbum.images[0] && SpotifyAlbum.images[0].url,
          undefined,
          SpotifyAlbum.external_urls.spotify
        ));
        this.type = mediaItemTypes.spotifyAlbum;
        this._suggestedSequencer = entryCommons.nextOrder.sequence;

        if (!this.__SpotifyAlbumId)
          this.__SpotifyAlbumId = SpotifyAlbum.id;
      }
      this._resolveMetainfos = resolveMetainfosProto;
      this._resolvePlaylist = resolveMetainfosProto;
      this._getBuilderObj = getBuilderObj;
      return this;
    }
    return mediaItemSpotifyAlbumAdapterFunc;
  });
