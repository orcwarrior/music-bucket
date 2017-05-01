/**
 * Created by orcwa on 29.05.2016.
 */

angular.module('musicBucketEngine')
  .factory('mediaItemSoundcloudSongAdapter', function ($q, $injector, mbStringUtils, virtualEntry, song, songCommons, mediaItem, mediaItemTypes, soundcloudApi, entryCommons) {

    var resolveMetainfos = function () {
      var deffered = $q.defer();
      if (_.contains(this.__resolvedSections, this.__sectionNames.metainfos)) {
        console.warn("mediaItem part already resolved!");
        deffered.resolve(this);
        return deffered.promise;
      }

      var slfMediaItem = this;
      this._isLoading = true;
      soundcloudApi.track.get(this.id)
        .then(function (response) {
          _.bind(_prepareMediaItemInfos, slfMediaItem, response.data)();
          slfMediaItem._isLoading = false;
          deffered.resolve(slfMediaItem);
        });

      return deffered.promise;
    }


    function createEntry() {
      var entry = __getSCTracksVirtualEntry();
      this.__forceMediaItemMetainfos = true;
      entry.addSong(new song(this, songCommons.songType.soundcloud, this.id));
      return entry;
    }

    const scVirtualEntryName = "Soundcloud Tracks";

    function __getSCTracksVirtualEntry() {
      var mbPlayerEngine = $injector.get('mbPlayerEngine');
      var curPlaylist = mbPlayerEngine.getPlaylist();
      if (curPlaylist) {
        var scTracksEntries = curPlaylist.findEntry({id: 'VIR-' + scVirtualEntryName});
        if (_.isUndefined(scTracksEntries)) {
          scTracksEntries = new virtualEntry(scVirtualEntryName, undefined, entryCommons.nextOrder.random);
          // it's need to be added (shouldn't be done actually here)
        }
        return scTracksEntries;
      }
    }

    function _prepareMediaItemInfos(soundcloudSong) {
      _.extendOwn(this, new mediaItem(
        soundcloudSong.id,
        soundcloudSong.title,
        (soundcloudSong.artwork_url || '').replace('large', 't500x500'),
        undefined,
        soundcloudApi.track.streamUrl(this.id)
      ));
      this.type = mediaItemTypes.soundcloudSong;
      this.description = soundcloudSong.description;
      var release = moment(soundcloudSong.created_at);
      this.dateReleased = release.format("LL");
      this.author = soundcloudSong.user.username;
      this.tags = (soundcloudSong.tag_list || '').split(' ').slice(0, 5);
      this.url = soundcloudApi.track.streamUrl(soundcloudSong.id);
      _.extendOwn(this, mbStringUtils.getArtistAndTitleFromFullname(soundcloudSong.title));


      this.__resolvedSections.push(this.__sectionNames.metainfos);
    }


    function getBuilderObj() {
      // No obj cause whole entry is not steered by mediaItem, it's just an single song in entry
      return undefined;
    }

    var mediaItemSoundcloudSongAdapterFunc = function mediaItemSoundcloudSongAdapter(soundcloudSong) {
      if (soundcloudSong._isBuilderObj) {
        _.extendOwn(this, new mediaItem(soundcloudSong.id));
        _.extendOwn(this, soundcloudSong);
        this._isBuilderObj = false;
      }
      else { /* regular Soundcloud song */
        _.bind(_prepareMediaItemInfos, this, soundcloudSong)();
      }
      this._resolveMetainfos = resolveMetainfos;
      this._resolveTracks = resolveMetainfos;
      this._getBuilderObj = getBuilderObj;
      this.__playlistEntryCreatorMethod = createEntry;
      return this;
    }
    return mediaItemSoundcloudSongAdapterFunc;
  })
;
