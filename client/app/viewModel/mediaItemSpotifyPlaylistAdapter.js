/**
 * Created by orcwa on 29.05.2016.
 */

angular.module('musicBucketEngine')
  .factory('mediaItemSpotifyPlaylistAdapter', function ($q, mediaItem, mediaItemTypes, spotifyApi) {

    var resolveMetainfosProto = function () {
      var deffered = $q.defer();
      if (_.contains(this.__resolvedSections, this.__sectionNames.metainfos)) {
        console.warn("mediaItem part already resolved!");
        deffered.resolve(this);
        return deffered.promise;
      }

      var slfMediaItem = this;
      this._isLoading = true;
      spotifyApi.users.playlists.get(this.__spotifyPlaylistId, this.__spotifyUserId)
        .then(function (response) {
          // BUGFIX: Fully reinitialize (builder make some fields empty
          _.extendOwn(slfMediaItem, new mediaItemSpotifyPlaylistAdapterFunc(response.data), slfMediaItem);
          slfMediaItem.dateReleased = slfMediaItem.dateAdded = null;
          slfMediaItem.length = null;

          slfMediaItem.description = response.data.description;
          slfMediaItem.author = response.data.owner.display_name || response.data.owner.id;
          slfMediaItem.tags = _prepareTags(response.data);
          // TODO: Grab if there is more than 100 items (exclude to new function)
          slfMediaItem.tracks = _.map(response.data.tracks.items, function (track) {
            track = track.track;
            return {
              artist: track.artists[0].name,
              album: track.album.name,
              albumArt: track.album.images[0] && track.album.images[0].url,
              title: track.name,
              trackNo: track.track_number,
              duration: track.duration_ms
            };
          });
          slfMediaItem.__resolvedSections = slfMediaItem.__resolvedSections.concat([
            slfMediaItem.__sectionNames.metainfos,
            slfMediaItem.__sectionNames.tracks
          ])
          slfMediaItem._isLoading = false;
          deffered.resolve(slfMediaItem);
        });

      return deffered.promise;
    }

    function getBuilderObj(mediaItem) {
      var builderObj = _.pick(this, 'type', '__spotifyPlaylistId', '__spotifyUserId');
      builderObj._isBuilderObj = true;
      return {name: 'mediaItemEntryBuilder', data: builderObj};
    }

    function _prepareTags(spotifyPlaylist) {
      var tags = [];
      // Gather all artists and release years:
      var artists = [], releaseYears = [];
      _.each(spotifyPlaylist.tracks.items, function (track) {
        _.each(track.track.artists, function (artist) {
          artists.push(artist.name);
        });
        // IDEA: Release years as tags too?
      });
      var TOP_ARTISTS_LIMIT = 4;
      var memoLength = 0;
      artists = _.chain(artists)
        .countBy(function (artist) {
          return artist;
        })
        .reduce(function (memo, val, key) {
          var min = _.min(memo);
          var minKey = _.findKey(memo, function (v) {
            return v === min;
          });
          if (min < val || min === Infinity || memoLength <= TOP_ARTISTS_LIMIT) {
            if (memoLength === TOP_ARTISTS_LIMIT) {
              delete memo[minKey];
              memoLength--;
            }
            memo[key] = val;
            memoLength++;
          }
          return memo;
        }, {})
        .keys()
        .value();
      tags = artists;
      return tags;
    }

    var mediaItemSpotifyPlaylistAdapterFunc = function mediaItemSpotifyPlaylistAdapter(spotifyPlaylist) {
      if (spotifyPlaylist._isBuilderObj) {
        _.extendOwn(this, new mediaItem(spotifyPlaylist.__spotifyPlaylistId));
        _.extendOwn(this, spotifyPlaylist);
        this._isBuilderObj = false;
      }
      else { /* regular spotify playlist */
        _.extendOwn(this, new mediaItem(
          spotifyPlaylist.id,
          spotifyPlaylist.name,
          spotifyPlaylist.images[0].url,
          spotifyPlaylist.tracks.total,
          spotifyPlaylist.external_urls.spotify
        ));
        this.type = mediaItemTypes.spotifyPlaylist;

        if (!this.__spotifyPlaylistId)
          this.__spotifyPlaylistId = spotifyPlaylist.id;
        if (!this.__spotifyUserId)
          this.__spotifyUserId = spotifyPlaylist.owner.id;
      }
      this._resolveMetainfos = resolveMetainfosProto;
      this._resolvePlaylist = resolveMetainfosProto;
      this._getBuilderObj = getBuilderObj;
      return this;
    }
    return mediaItemSpotifyPlaylistAdapterFunc;
  });
