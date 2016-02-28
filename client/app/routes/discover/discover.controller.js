'use strict';

angular.module('musicBucketApp')
  .factory('discoverMetainfos', function ($log, $location, songSeeker, lastFmApi, mbPlayerEngine, musicbrainzApi, discographyCollector, mbStringUtils) {
    var prevDiscoverMetainfos = undefined;
    var discoverMetainfosHistory = [];

    function discoverMetainfosEntry(config, discoverInfos, palette) {
      this.config = config;
      this.discoverInfos = discoverInfos;
      this.palette = palette;
      return this;
    }

    function discoverMetainfos(createConfig, changesCb) {

      var discoverMetainfosInstance = this;
      if (createConfig && createConfig.metainfos) {
        createConfig = {
          artist: createConfig.metainfos.artist,
          album: createConfig.metainfos.album,
          title: createConfig.metainfos.title
        };
      }
      if (!_.isUndefined(prevDiscoverMetainfos))
        if (__discoverConfigEquality(createConfig, prevDiscoverMetainfos.infos))
          return prevDiscoverMetainfos; // return old, there is no reason to fire same requests...
      // else // clear after old objects
      //  prevDiscoverMetainfos.discoverInfos.discography.clearListeners();

      // Pass old palette obj to new discoverMetainfos for meaningful transition:
      if (!_.isUndefined(prevDiscoverMetainfos))
        this.palette = prevDiscoverMetainfos.palette;
      // Clear history:
      discoverMetainfosHistory.length = 0;

      /* private functions */
      function __discoverConfigEquality(one, two) {
        one = _.pick(one, 'artist'/*, 'album', 'title'*/);
        two = _.pick(two, 'artist'/*, 'album', 'title'*/);
        return _.isEqual(one, two);
      }

      /* public object*/
      this.infos = createConfig;
      if (!_.isUndefined(this.infos))
        this.infos.remixer = mbStringUtils.extractRemixer(this.infos.title);
      this.discoverInfos = {
        artist: undefined,
        artistTopTracks: undefined,
        discography: undefined
      };
      this.tmpMetainfos = {};
      this.__changesCb = changesCb;
      /* observe object */
      this._observeCb = function (changes) {
        if (changes[0].name == "artist") {
          var artist = changes[0].object.artist;
          discoverMetainfosInstance.tmpMetainfos.discography = new discographyCollector(artist.name, artist.mbid, function (discography) {
            discoverMetainfosInstance.infos.selectedAlbum = discoverMetainfosInstance.infos.album;
            discoverMetainfosInstance.__changesCb("discography");
          });
        }
        if (changes[0].object.artist && changes[0].object.discography && changes[0].object.artistTopTracks) {
          discoverMetainfosInstance.tmpMetainfos.allPrepared = true;
          discoverMetainfosInstance.discoverInfos = discoverMetainfosInstance.tmpMetainfos;
          discoverMetainfosInstance.updateUrlParams();
        }
        if (changes[0].name !== "discography")
          discoverMetainfosInstance.__changesCb(changes[0].name);
      };

      this.requestInfos = function (partialChangeConfig) {
        var self = this;
        var conf = _.clone(this.infos);
        if (partialChangeConfig && !_.isEqual(partialChangeConfig, this.infos)) {
          this.infos = conf = _.extend(conf, partialChangeConfig);
        }

        if (__discoverConfigEquality(conf, this.getPrevious().config) || _.isEmpty(conf)) {
          // BUGFIX: When same artist kicks-in:
          changesCb("artist");
          changesCb("artistTopTracks");
          changesCb("discography");
          return; // Don't lookup for same config
        }
        $log.info('New discover request: ');
        $log.info(conf);

        this.tmpMetainfos = {};

        discoverMetainfosHistory.push(new discoverMetainfosEntry(conf, this.tmpMetainfos));
        if (!_.isUndefined(this.infos))
          this.infos.remixer = mbStringUtils.extractRemixer(conf.title);

        Object.observe(this.tmpMetainfos, this._observeCb);
        // Artist infos
        (function artistInfos() {
          lastFmApi.artist.getInfo(conf.artist)
            .then(function (response) {
              if (response.status == 200)
                self.tmpMetainfos.artist = response.data.artist;
            });
          lastFmApi.artist.getTopTracks(conf.artist)
            .then(function (response) {
              if (response.status == 200 && response.data.toptracks) {
                self.tmpMetainfos.artistTopTracks = {track: response.data.toptracks.track.slice(0, 12)};
                self.tmpMetainfos.artistTopTracks.maxplayscount = response.data.toptracks.track[0].playcount;
              }
            });
        })();
        return this; // chaining
      };

      this.buildUrlParamsSongPlaceholder = function () {
        if ($location.search().artist) {
          this.infos = createConfig = _.pick($location.search(), 'artist', 'album', 'title');
          this.infos.remixer = mbStringUtils.extractRemixer(this.infos.title);
        }
        return this; // chaining
      };
      this.updateUrlParams = function () {
        console.log('[DiscoverMeta] Update url params');
        if (_.isUndefined(this.infos)) return this;

        var anyChanges = false;
        if ($location.search().artist != this.infos.artist
          || $location.search().title != this.infos.title
          || $location.search().album != this.infos.album)
          anyChanges = true;

        $location.search('artist', this.infos.artist);
        $location.search('title', this.infos.title);
        // NEW: If there is another selected album -> set it on :>
        // if (this.infos.selectedAlbum)
        //   $location.search('album', this.infos.selectedAlbum);
        $location.search('album', this.infos.album);

        if (anyChanges)
          $location.replace();

        return this; // chaining
      };

      prevDiscoverMetainfos = this;
      return this;
    };
    discoverMetainfos.prototype.songAction = function (action, trackName, trackIdx, scope) {
      //scope.$apply(function () {
      scope.topTracks[trackIdx] = {isLoading: true};
      //});
      var metainfos = {artist: this.infos.artist, album: undefined, title: trackName};
      new songSeeker(metainfos, true)
        .then(function (song) {
          scope.$applyAsync(function () {
            scope.topTracks[trackIdx].isLoading = false;
          });

          switch (action) {
            case "play" :
              mbPlayerEngine.playSong(song, true);
              break;
            case "play-next":
              mbPlayerEngine.queueSongNext(song);
              break;
            case "enqueue":
              mbPlayerEngine.queueSong(song);
              break;
          }
        });
    };

    discoverMetainfos.prototype.markPalette = function (palette) {
      this.getPrevious().palette = this.palette = palette;
    }
    discoverMetainfos.prototype.getPrevious = function () {
      return _.last(discoverMetainfosHistory) || {};
    };
    // For button to get back to playing song metainfos:
    discoverMetainfos.prototype.hasRootMetainfos = function () {
      return (discoverMetainfosHistory.length > 1
      && discoverMetainfosHistory[1].discoverInfos.allPrepared);
    };
    discoverMetainfos.prototype.backToRootMetainfos = function () {
      var root = _.first(discoverMetainfosHistory);
      this.infos = root.config;
      this.discoverInfos = root.discoverInfos;
      this.palette = root.palette;
      this.updateUrlParams();
      discoverMetainfosHistory.length = 1;
      if (!_.isUndefined(this.infos))
        this.infos.remixer = mbStringUtils.extractRemixer(conf.title);
    };
    return discoverMetainfos;
  }
)
  .controller('discoverCtrl', function ($log, $window, $scope, $timeout, $location, mbPlayerEngine, discoverMetainfos, albumEntryBuilder) {

    var lastSong = {};
    var storedPlaysCounts = [];
    var bioAlreadyLoaded = false;

    $scope.topTracks = []; // for UI loading
    // Params metainfos:
    loadSongDiscoverInfos(undefined);

    mbPlayerEngine.listen("songChange", function (engine, eventName, song) {
      loadSongDiscoverInfos(song);
      updateSelectedAlbum();
    });
    $scope.curSong = function () {
      return mbPlayerEngine.getCurrentSong();
    };

    if (!_.isUndefined($scope.curSong())) {
      loadSongDiscoverInfos($scope.curSong());
    }
    ;

    $timeout(function paletteChangeHandler() {
      var img = document.querySelector('.artist-col-wrapper #artistImgPalette');
      angular.element(img).bind('paletteReady', function (event, palette) {
        console.log('[Discover] artist image loaded. (showing new infos)');
        $scope.$broadcast('discover:artist:updated');
        $scope.song.markPalette(palette);
      });
    }, 100);

    $scope.songAction = function (action, trackName, trackIdx) {
      $scope.song.songAction(action, trackName, trackIdx, $scope);
    };
    $scope.orderTopTracks = function (track) {
      var num = parseInt(track.playcount) * (-1);
      return (_.isNaN(num)) ? -1 : num;
    };
    $scope.artPalette = function () {
      return $scope.song.palette || $scope.song.getPrevious().palette;
    };

    $scope.showScrollbar = function () {
      return ($scope.artistScroll == true && $scope.mobileView == false);
    };

    $scope.addAlbumToPlaylist = function (album) {
      var albumEntry = albumEntryBuilder.build(album);
      mbPlayerEngine.getPlaylist().addEntry(albumEntry);
    };
    $scope.$watch('song.infos.selectedAlbum', function (newVal, oldVal) {
      $scope.selectedAlbum = undefined;
      updateSelectedAlbum();
    });
    $scope.$watch('song.discoverInfos.discography.albums', function (newVal, oldVal) {
      updateSelectedAlbum();
    });

    $scope.mobileView = false;
    $scope.$watch(function () {
      return $window.innerWidth;
    }, function (value) {
      $scope.mobileView = (value <= 990);
    });

    $scope.requestLinkedAristInfos = function (artistName, title) {
      $scope.song.requestInfos({'artist': artistName, 'album': '', 'title': title || ""});
    };
    /* privates*/
    function loadSongDiscoverInfos(song) {
      $scope.song = new discoverMetainfos(song, function (fieldLoaded) {
        $scope.$applyAsync(function () {
          $scope.infosLoaded[fieldLoaded] = true;
        });
        $scope.infosLoaded = {};
        $scope.infosLoaded.artist = !_.isUndefined($scope.song.discoverInfos.artist);
        $scope.infosLoaded.discograpy = !_.isUndefined($scope.song.discoverInfos.discograpy);
        $scope.infosLoaded.artistTopTracks = !_.isUndefined($scope.song.discoverInfos.artistTopTracks);

      });
      if (_.isUndefined(song))
        $scope.song = $scope.song.buildUrlParamsSongPlaceholder();
      $scope.song.requestInfos();
    }

    function updateSelectedAlbum() {
      if (_.isUndefined($scope.song) || _.isUndefined($scope.song.infos) || _.isUndefined($scope.song.discoverInfos.discography) || _.isUndefined($scope.song.discoverInfos.discography.getAlbumByName))
        return;
      $log.info("discover: new album selected: " + $scope.song.infos.selectedAlbum || $scope.song.infos.album);
      var album = $scope.song.discoverInfos.discography.getAlbumByName($scope.song.infos.selectedAlbum || $scope.song.infos.album);
      if (!_.isUndefined(album))
        album.getInfos()
          .then(function (infos) {
            $scope.selectedAlbum = infos;
            $log.info("discover: album setted: " + $scope.selectedAlbum.name);
          });
    }
  });
