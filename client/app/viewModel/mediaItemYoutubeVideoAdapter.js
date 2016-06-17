/**
 * Created by orcwa on 29.05.2016.
 */

angular.module('musicBucketEngine')
  .factory('mediaItemYoutubeVideoAdapter', function ($q, $injector, mbStringUtils, mediaItem, mediaItemTypes, virtualEntry, entryCommons, song, songCommons) {

    var resolveMetainfos = function () {
      var deffered = $q.defer();
      console.warn("Nothing more to fetch???");
      deffered.resolve(this);
      return deffered.promise;
    };

    function getBuilderObj() {
      // No obj cause whole entry is not steered by mediaItem, it's just an single song in entry
      return undefined;
    }
    function createEntry () {
      var entry = __getYTVideosVirtualEntry();
      this.__forceMediaItemMetainfos = true;
      entry.addSong(new song(this, songCommons.songType.youtube, this.id));
      return entry;
    }

    const ytVirtualEntryName = "Youtube Videos";
    function __getYTVideosVirtualEntry() {
      var mbPlayerEngine = $injector.get('mbPlayerEngine');
      var curPlaylist = mbPlayerEngine.getPlaylist();
      if (curPlaylist) {
        var ytVideosEntries = curPlaylist.findEntry({id: 'VIR-' + ytVirtualEntryName});
        if (_.isUndefined(ytVideosEntries)) {
          ytVideosEntries = new virtualEntry(ytVirtualEntryName, undefined, entryCommons.nextOrder.random);
          // it's need to be added (shouldn't be done actually here)
        }
        return ytVideosEntries;
      }
    }

    var mediaItemYoutubeVideoAdapterFunc = function mediaItemYoutubeVideoAdapter(youtubeVideo) {
      if (youtubeVideo._isBuilderObj) {
        _.extendOwn(this, new mediaItem(youtubeVideo.id.videoId));
        _.extendOwn(this, youtubeVideo);
        this._isBuilderObj = false;
      }
      else { /* regular spotify playlist */
        _.extendOwn(this, new mediaItem(
          youtubeVideo.id.videoId,
          youtubeVideo.snippet.title,
          youtubeVideo.snippet.thumbnails.high.url,
          null,
          "http://youtu.be/?v="+youtubeVideo.id.videoId
        ));
        _.extendOwn(this, mbStringUtils.getArtistAndTitleFromFullname(this.name));
        this.type = mediaItemTypes.youtubeVideo;
        this.author = youtubeVideo.snippet.channelTitle;
        this.description = youtubeVideo.snippet.description;
        var release = moment(youtubeVideo.snippet.publishedAt);
        this.dateReleased = release.format("LL");

        if (!this.__YoutubeVideoId)
          this.__YoutubeVideoId = youtubeVideo.id.videoId;
      }
      this._resolveMetainfos = resolveMetainfos;
      this._resolvePlaylist = resolveMetainfos;
      this._getBuilderObj = getBuilderObj;
      this.__playlistEntryCreatorMethod = createEntry;
      return this;
    }
    return mediaItemYoutubeVideoAdapterFunc;
  });
