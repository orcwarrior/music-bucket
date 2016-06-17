/**
 * Created by orcwa on 29.05.2016.
 */

angular.module('musicBucketEngine')
  .factory('mediaItemSoundcloudPlaylistAdapter', function ($q, $injector, songMetainfos, songCommons, song, mbStringUtils, virtualEntry, mediaItem, mediaItemTypes, soundcloudApi, entryCommons) {

    var resolveTracks = function () {
      var deffered = $q.defer();
      if (_.contains(this.__resolvedSections, this.__sectionNames.tracks)) {
        console.warn("mediaItem part already resolved!");
        deffered.resolve(this);
      } else {
        var slfMediaItem = this;
        this._isLoading = true;

        soundcloudApi.playlist.get(this.id)
          .then(function (response) {
            slfMediaItem.tracks = _.map(response.data.tracks, function (track) {
              return _.extend({
                artist: track.user.username,
                album: undefined,
                albumArt: (track.artwork_url || '').replace('large', 't500x500'),
                duration: track.duration, // to ms
                id: track.id, // ID is must be!
                title: track.title,
                trackNo: undefined,
                url: soundcloudApi.track.streamUrl(track.id)
              }, mbStringUtils.getArtistAndTitleFromFullname(track.title));
            });
            _.bind(_prepareMediaItemInfos, slfMediaItem, response.data)();
            slfMediaItem.__resolvedSections.push(slfMediaItem.__sectionNames.tracks);
            slfMediaItem._isLoading = false;
            deffered.resolve(slfMediaItem);
          });
      }
      return deffered.promise;
    };

    function createEntry() {
      var entry = new virtualEntry(this.name, undefined, this._suggestedSequencer || entryCommons.nextOrder.random);
      _.each(this.tracks, function (track) {
        entry.addSong(new song(new songMetainfos(track), songCommons.songType.soundcloud, entry.id));
        /*,resolveFunction (use default)*/
      });
      return entry;
    }

    function _prepareMediaItemInfos(soundcloudPlaylist) {
      _.extendOwn(this, new mediaItem(
        soundcloudPlaylist.id,
        soundcloudPlaylist.title,
        (soundcloudPlaylist.artwork_url || '').replace('large', 't500x500'),
        soundcloudPlaylist.track_count,
        soundcloudApi.track.streamUrl(this.id)
      ));
      this.type = mediaItemTypes.soundcloudPlaylist;
      this.description = soundcloudPlaylist.description;
      var release = moment(soundcloudPlaylist.created_at);
      this.dateReleased = release.format("LL");
      this.author = soundcloudPlaylist.user.username;
      this.tags = (soundcloudPlaylist.tag_list || '').split(' ').slice(0, 5);
      _.extendOwn(this, mbStringUtils.getArtistAndTitleFromFullname(soundcloudPlaylist.title));

      this.__resolvedSections.push(this.__sectionNames.metainfos);

      this._resolveMetainfos = resolveTracks;
      this._resolvePlaylist = resolveTracks;
      this._getBuilderObj = getBuilderObj;
      this.__playlistEntryCreatorMethod = createEntry;
    }

    function getBuilderObj() {
      var builderObj = _.pick(this, 'type', 'id');
      builderObj._isBuilderObj = true;
      return {name: 'mediaItemEntryBuilder', data: builderObj};
    }

    var mediaItemSoundcloudPlaylistAdapterFunc = function mediaItemSoundcloudPlaylistAdapter(soundcloudPlaylist) {
      if (soundcloudPlaylist._isBuilderObj) {
        _.extendOwn(this, new mediaItem(soundcloudPlaylist.id));
        _.extendOwn(this, soundcloudPlaylist);
        this._isBuilderObj = false;
        this._resolveMetainfos = resolveTracks;
        this._resolvePlaylist = resolveTracks;
        this._getBuilderObj = getBuilderObj;
        this.__playlistEntryCreatorMethod = createEntry;
      }
      else { /* regular Soundcloud song */
        _.bind(_prepareMediaItemInfos, this, soundcloudPlaylist)();
      }
      return this;
    }
    return mediaItemSoundcloudPlaylistAdapterFunc;
  })
;
