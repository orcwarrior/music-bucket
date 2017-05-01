/**
 * Created by orcwa on 29.05.2016.
 */

angular.module('musicBucketEngine')
  .factory('mediaItemSpotifyPlaylistAdapter', function ($q, mediaItem, mediaItemTypes, spotifyApi) {

    function _extractTrackInfos(trackItem) {
      var track = trackItem.track;
      return {
        artist: track.artists[0].name,
        album: track.album.name,
        albumArt: track.album.images[0] && track.album.images[0].url,
        title: track.name,
        trackNo: track.track_number,
        duration: track.duration_ms
      };
    }

    function _getNextTracksOfPlaylist(playlistId, userId, tracksObj, passedPromise) {
      if (!tracksObj) {
        tracksObj = {offset: 0, limit: 100, items: []};
      }
      spotifyApi.users.playlists.tracks(playlistId, userId, tracksObj.offset, tracksObj.limit)
        .then(function (response) {
          console.log("New tracks obtained!");
          tracksObj.items = tracksObj.items.concat(response.data.items);
          tracksObj.limit = response.data.limit;
          tracksObj.offset += tracksObj.limit;
          /*step up*/

          if (!response.data.next) { // last tracks of playlist
            console.log("It was last tracks of playlist!");
            passedPromise.resolve(tracksObj);
          } else {
            // TODO: Progress obj?
            console.log("Calling for new part of tracks (%s-%s/%s", tracksObj.offset, tracksObj.limit, response.data.total);
            _getNextTracksOfPlaylist(playlistId, userId, tracksObj, passedPromise);
          }
        }, function error(err) {
          console.error(err);
          passedPromise.reject(err);
        })
        .catch(function catchedErr(err) {
          console.error(err);
          passedPromise.reject(err);
        });

    }

    var resolveTracksProto = function () {
      if (_.contains(this.__resolvedSections, this.__sectionNames.tracks)) {
        console.warn("mediaItem part already resolved!");
        return $q.resolve(this);
      }
      // There's need to download rest of the tracks? (> 100 tracks)
      var mainDeffered = $q.defer();
      var tracksDeffered = $q.defer();
      var slfMediaItem = this;
      this._isLoading = true;
      _getNextTracksOfPlaylist(this.__spotifyPlaylistId, this.__spotifyUserId,
        slfMediaItem.tracks, tracksDeffered);
      tracksDeffered.promise.then(function resolvedAllPlaylistTracks(tracksObj) {
        slfMediaItem.tracks = _.map(tracksObj.items, _extractTrackInfos);
        slfMediaItem.__resolvedSections.push(slfMediaItem.__sectionNames.tracks);
        slfMediaItem._isLoading = false;
        mainDeffered.resolve(slfMediaItem);
      }).catch(function (err) {
        mainDeffered.reject(err);
      });
      return mainDeffered.promise;
    }

    var resolveMetainfosProto = function () {
      var deffered = $q.defer();
      if (_.contains(this.__resolvedSections, this.__sectionNames.metainfos)) {
        console.warn("mediaItem part already resolved!");
        return $q.resolve(this);
      }

      var slfMediaItem = this;
      this._isLoading = true;
      spotifyApi.users.playlists.get(this.__spotifyPlaylistId, this.__spotifyUserId)
        .then(function (response) {
          console.warn("Spotify resolved: " + response);
          // BUGFIX: Fully reinitialize (builder make some fields empty)
          _.extendOwn(slfMediaItem, new mediaItemSpotifyPlaylistAdapterFunc(response.data), slfMediaItem);
          slfMediaItem.dateReleased = slfMediaItem.dateAdded = null;
          slfMediaItem.length = null;

          slfMediaItem.description = response.data.description;
          slfMediaItem.author = response.data.owner.display_name || response.data.owner.id;
          slfMediaItem.tags = _prepareTags(response.data);

          slfMediaItem.__allTracksGrabbed = (!_.isNull(response.data.tracks.next));
          if (!slfMediaItem.tracks)
            slfMediaItem.tracks = _.map(response.data.tracks.items, _extractTrackInfos);
          slfMediaItem.__resolvedSections.push(slfMediaItem.__sectionNames.metainfos);
          if (slfMediaItem.__allTracksGrabbed)
            slfMediaItem.__resolvedSections.push(slfMediaItem.__sectionNames.tracks);
          slfMediaItem._isLoading = false;
          deffered.resolve(slfMediaItem);
        }).catch(function (err) {
          console.warn("MediaItem Spotify Playlist: Fetching playlist error: ", err);
          slfMediaItem.name = "Error fetching spotify playlist";
          slfMediaItem._isLoading = false;
          deffered.reject(slfMediaItem);
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
        _.bind(resolveMetainfosProto, this)(); // build metainfos
        this._isBuilderObj = false;
      }
      else { /* regular spotify playlist */
        // REFACTOR: arguments to simple js object.
        _.extendOwn(this, new mediaItem(
          spotifyPlaylist.id,
          spotifyPlaylist.name,
          spotifyPlaylist.images[0] && spotifyPlaylist.images[0].url,
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
      this._resolveTracks = resolveTracksProto;
      this._getBuilderObj = getBuilderObj;
      return this;
    }
    return mediaItemSpotifyPlaylistAdapterFunc;
  });
