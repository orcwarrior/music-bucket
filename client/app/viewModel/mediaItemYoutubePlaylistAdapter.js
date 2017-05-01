/**
 * Created by orcwa on 29.05.2016.
 */

angular.module('musicBucketEngine')
  .factory('mediaItemYoutubePlaylistAdapter', function ($q, mediaItem, mediaItemTypes, youtubeApi, virtualEntry, entryCommons, song, songMetainfos, songCommons) {

    var resolveMetainfosProto = function () {
      var deffered = $q.defer();
      if (_.contains(this.__resolvedSections, this.__sectionNames.metainfos)) {
        console.warn("mediaItem part already resolved!");
        deffered.resolve(this);
        return deffered.promise;
      }

      var slfMediaItem = this;
      this._isLoading = true;

      youtubeApi.playlist.getAllEntries(this.__youtubePlaylistId)
        .then(function (tracks) {
          slfMediaItem.tracks = _.map(tracks, function (track) {
            var trackObj = {
              id: track.snippet.resourceId.videoId,
              title: track.snippet.title, // TODO: (artist/title) extraction?
              albumArt: track.snippet.thumbnails && track.snippet.thumbnails.high.url
            };
            _.extendOwn(trackObj, _getArtistAndTitleFromFullname(trackObj.title));
            return trackObj;
          });
          slfMediaItem.__resolvedSections = slfMediaItem.__resolvedSections.concat([
            slfMediaItem.__sectionNames.metainfos,
            slfMediaItem.__sectionNames.tracks
          ])
          slfMediaItem.songsCount = tracks.length;
          slfMediaItem._isLoading = false;
          deffered.resolve(slfMediaItem);
        });
      return deffered.promise;
    }

    function _getArtistAndTitleFromFullname(fullname) {
      var artist = fullname.split(" - ")[0] || fullname.split(" ")[0] || "";
      var title = fullname.split(" - ")[1] || fullname.split(" ")[1] || fullname;
      return {artist: artist, title: title};
    }

    function createEntry() {
      var entry = new virtualEntry(this.name, undefined, this._suggestedSequencer || entryCommons.nextOrder.random);
      _.each(this.tracks, function (track) {
        entry.addSong(new song(new songMetainfos(track), songCommons.songType.youtube, entry.id));
        /*,resolveFunction (use default)*/
      });
      return entry;
    }
    function getBuilderObj() {
      var builderObj = _.pick(this, 'type', '__youtubePlaylistId');
      builderObj._isBuilderObj = true;
      return {name: 'mediaItemEntryBuilder', data: builderObj};
    }

    var mediaItemYoutubePlaylistAdapterFunc = function mediaItemYoutubePlaylistAdapter(youtubePlaylist) {
      if (youtubePlaylist._isBuilderObj) {
        _.extendOwn(this, new mediaItem(youtubePlaylist.__youtubePlaylistId));
        _.extendOwn(this, youtubePlaylist);
        this._isBuilderObj = false;
      }
      else {
        _.extendOwn(this, new mediaItem(
          youtubePlaylist.id.playlistId,
          youtubePlaylist.snippet.title,
          youtubePlaylist.snippet.thumbnails.high.url,
          null,
          "http://youtu.be/?v=" + youtubePlaylist.id.playlistId
        ));
        this.type = mediaItemTypes.youtubePlaylist;
        this.author = youtubePlaylist.snippet.channelTitle;
        this.description = youtubePlaylist.snippet.description;
        var release = moment(youtubePlaylist.snippet.publishedAt);
        this.dateReleased = release.format("LL");

        if (!this.__youtubePlaylistId)
          this.__youtubePlaylistId = youtubePlaylist.id.playlistId;
      }
      this._resolveMetainfos = resolveMetainfosProto;
      this._resolveTracks = resolveMetainfosProto;
      this._getBuilderObj = getBuilderObj;
      this.__playlistEntryCreatorMethod = createEntry;
      return this;
    }
    return mediaItemYoutubePlaylistAdapterFunc;
  }
)
;
