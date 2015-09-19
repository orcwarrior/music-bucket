'use strict';

angular.module('musicBucketApp')
  .factory('discoverMetainfos', function ($log, $location, songBuilder, lastFmApi, mbPlayerEngine) {
    var prevDiscoverMetainfos = undefined;
    var discoverMetainfosHistory = [];

    function discoverMetainfosEntry(config, discoverInfos, palette) {
      this.config = config;
      this.discoverInfos = discoverInfos;
      this.palette = palette;
      return this;
    }

    function discoverMetainfos(createConfig) {

      var discoverMetainfosInstance = this;
      if (createConfig && createConfig.metainfos) {
        createConfig = {
          artist: createConfig.metainfos.artist,
          album: createConfig.metainfos.album,
          title: createConfig.metainfos.title
        };
      }
      if (!_.isUndefined(prevDiscoverMetainfos) && __discoverConfigEquality(createConfig, prevDiscoverMetainfos.infos))
        return prevDiscoverMetainfos; // return old, there is no reason to fire same requests...

      // Pass old palette obj to new discoverMetainfos for meaningful transition:
      if (!_.isUndefined(prevDiscoverMetainfos))
        this.palette = prevDiscoverMetainfos.palette;
      // Clear history:
      discoverMetainfosHistory.length = 0;

      /* private functions */
      function __discoverConfigEquality(one, two) {
        one = _.pick(one, 'artist', 'album', 'title');
        two = _.pick(two, 'artist', 'album', 'title');
        return _.isEqual(one, two);
      }

      function __isNewArtist(config) {
        return config.artist !== "" && _.isUndefined(previousDiscMeta.artist) || previousDiscMeta.artist.toUpperCase() !== config.artist.toUpperCase();
      }

      function setTrackProgress(idx, percentProgress) {
        if ($scope.artistTopTracks.track[idx].circleValue === storedPlaysCounts[idx])
          return; // already loaded.
        $scope.artistTopTracks.track[idx].circleValue = $scope.artistTopTracks.maxplayscount * percentProgress;
      }


      /* public object*/
      this.infos = createConfig;
      this.discoverInfos = {artist: null, artistTopTracks: null, artistTopAlbums: null};
      this.tmpMetainfos = {};
      /* observe object */
      this._observeCb = function (changes) {
        if (changes[0].object.artist && changes[0].object.artistTopAlbums && changes[0].object.artistTopTracks) {
          discoverMetainfosInstance.tmpMetainfos.allPrepared = true;
          discoverMetainfosInstance.discoverInfos = discoverMetainfosInstance.tmpMetainfos;
          discoverMetainfosInstance.updateUrlParams();
        }
      };
      this.requestInfos = function (partialChangeConfig) {
        var self = this;
        var conf = _.clone(this.infos);
        if (partialChangeConfig && !_.isEqual(partialChangeConfig, this.infos))
          this.infos = conf = _.extend(conf, partialChangeConfig);

        if (__discoverConfigEquality(conf, this.getPrevious().config) || _.isEmpty(conf))
          return; // Don't lookup for same config
        $log.info('New discover request: ');
        $log.info(conf);

        this.tmpMetainfos = {};

        discoverMetainfosHistory.push(new discoverMetainfosEntry(conf, this.tmpMetainfos));
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
                self.tmpMetainfos.artistTopTracks = response.data.toptracks;
                self.tmpMetainfos.artistTopTracks.maxplayscount = response.data.toptracks.track[0].playcount;
              }
            });
          lastFmApi.artist.getTopAlbums(conf.artist)
            .then(function (response) {
              if (response.status == 200 && response.data.topalbums)
                self.tmpMetainfos.artistTopAlbums = response.data.topalbums.album;
            });
        })();
        return this; // chaining
      };

      this.buildUrlParamsSongPlaceholder = function () {
        if ($location.search().artist)
          this.infos = createConfig = _.pick($location.search(), 'artist', 'album', 'title');
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
        $location.search('album', this.infos.album);

        if (anyChanges)
          $location.replace();

        return this; // chaining
      };

      prevDiscoverMetainfos = this;
      return this;
    };
    discoverMetainfos.prototype.songAction = function (action, query, idx, discoverProperty) {
      // if (this.discoverInfos.artistTopTracks)
      // // All visual stuff:
      // $scope.artistTopTracks.track[idx].isLoading = true;
      // storedPlaysCounts[idx] = $scope.artistTopTracks.track[idx].playcount;
      // $scope.artistTopTracks.track[idx].circleValue = 0;
      // $timeout(function () {
      //   setTrackProgress(idx, 0.5);
      // }, 100);
      // $timeout(function () {
      //   setTrackProgress(idx, 1);
      // }, 500);
      // $timeout(function () {
      //   setTrackProgress(idx, 0);
      // }, 1000);
      // $timeout(function () {
      //   setTrackProgress(idx, 1);
      // }, 1600);

      songBuilder.createSong(query)
        .then(function (song) {
          // $scope.artistTopTracks.track[idx].circleValue = storedPlaysCounts[idx];
          // $scope.artistTopTracks.track[idx].isLoading = false;

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
    };
    return discoverMetainfos;
  }
)
  .controller('discoverCtrl', function ($window, $scope, $timeout, $location, mbPlayerEngine, lastFmApi, songBuilder, discoverMetainfos) {

    var lastSong = {};
    var storedPlaysCounts = [];
    var bioAlreadyLoaded = false;

    // Params metainfos:
    $scope.song = new discoverMetainfos().buildUrlParamsSongPlaceholder();
    $scope.song.requestInfos();

    mbPlayerEngine.listen("songChange", function (engine, eventName, song) {
      $scope.song = new discoverMetainfos(song);
      $scope.song.requestInfos();
    });
    $scope.curSong = function () {
      return mbPlayerEngine.getCurrentSong();
    };

    if (!_.isUndefined($scope.curSong())) {
      $scope.song = new discoverMetainfos($scope.curSong());
      $scope.song.requestInfos();
    };

    $timeout(function paletteChangeHandler() {
      var img = document.querySelector('.artist-col-wrapper #artistImgPalette');
      angular.element(img).bind('paletteReady', function (event, palette) {
        console.log('[Discover] artist image loaded. (showing new infos)');
        $scope.$broadcast('discover:artist:updated');
        $scope.song.markPalette(palette);
      });
    }, 100);

    $scope.songAction = function (action, query, idx) {

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
    $scope.mobileView = false;
    $scope.$watch(function () {
      return $window.innerWidth;
    }, function (value) {
      $scope.mobileView = (value <= 990);
    });
  });
