'use strict';

angular.module('musicBucketApp')
  .service('mbPlayerEngine', function ($rootScope, $log, playlist, queue, tracksHistory, angularPlayer, mbYoutubePlayer) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var injector = angular.injector(['musicBucketEngine']);
    var _playlist;
    var _queue = new injector.get('queue').constructor();
    var currentSong = undefined;

    /* privates */
    /* engines */
    var engines = null;

    function initEngines() {
      if (_.isNull(engines))
        engines = {
          sm2: angularPlayer,
          youtube: mbYoutubePlayer
        };

    }

    function songEngine2playerEngine(song) {
      if (_.isNull(song)) return null;
      else switch (song.engine.name) {
        case "songEngineSM2":
          return engines.sm2;
        case "songEngineYoutube":
          return engines.youtube;
        default:
          throw Error("No player-engine suited to song-engine: " + this.getCurrentSong().engine.name)
      }
    }

    /* mbPlayerEngine */
    function mbPlayerEngine() {
      var bufferingNextSongAlreadyCalled = false;
      var songsRegistry = {}; // song registy, key: $songId, val: songObj
      this.isPlaying = false;

      this.playlist = _playlist;
      this.queue = _queue;
      this.tracksHistory = new tracksHistory();

      this.getSongById = function (id) { return songsRegistry[id]; };
      /*
       * Play
       * */
      this.play = function () {
        $log.info('mbPlayerEngine: Play called!');
        var _player = this;
        bufferingNextSongAlreadyCalled = false;
        if (_.isUndefined(this.getCurrentSong())) {
          // player not played anything, get a track
          // There is no any in queue? Create sth..
          $log.info('mbPlayerEngine: Play: there is no currentTrack');
          if (!this.queue.hasNext()) {
            $log.info('mbPlayerEngine: Play: there is no song in Queue, pushing some...');
            this.pushNextSongToQueue(function (nextTrack) {
              var queueEntry = _player.queue.dequeue();
              if (!queueEntry.song.isBuffered()) queueEntry.song.buffer();
              if (queueEntry !== null) /* setTimeout(function() { */_player.playSong(queueEntry.song); // }, 0);
            });

          } else {
            $log.info('mbPlayerEngine: Play: getting song from queue...');
            var queueEntry = this.queue.dequeue();
            if (queueEntry !== null) _player.playSong(queueEntry.song);
          }
        } else {
          $log.info('mbPlayerEngine: Play: just play current Song');
          this.playSong(this.getCurrentSong());
        }
      };
      /*
       * Pause
       * */
      this.pause = function () {
        $log.info('mbPlayerEngine: Pause track ' + this.getCurrentSong().metainfos.id);
        this.getCurrentSong().pause();
        this.isPlaying = false;
      };
      /*
       * Stop
       * */
      this.stop = function () {
        $log.info('mbPlayerEngine: Stop track ' + this.getCurrentSong().metainfos.id);
        this.getCurrentSong().stop();
      };
      /*
       * togglePlay
       * */
      this.togglePlay = function () {
        $log.info('mbPlayerEngine: TogglePlay track: ' + this.isPlaying);
        if (this.isPlaying) this.pause();
        else                this.play();
      };
      /*
       * nextTrack
       * */
      this.nextTrack = function (saveToHistory) {
        $log.info('mbPlayerEngine: Next track...');
        var _player = this;

        // Get next song from queue:
        if (!this.queue.hasNext()) {
          $log.info('mbPlayerEngine: Next track: ...still not in queue, queueing');
          this.pushNextSongToQueue(function (nextTrack) {
            var queueEntry = _player.queue.dequeue();
            queueEntry.song.buffer();
            if (queueEntry !== null) _player.playSong(queueEntry.song, saveToHistory);
          });
        } else {
          $log.info('mbPlayerEngine: Next track: ...playing song from queue');
          var queueEntry = _player.queue.dequeue();
          if (queueEntry !== null) _player.playSong(queueEntry.song, saveToHistory);
        }
      };
      /*
       * prevTrack
       * */
      this.prevTrack = function () {
        var currentSong = this.getCurrentSong();
        if (!_.isUndefined(currentSong)) {
          this.queue.enqueueNext(currentSong);
        }
        this.playSong(this.tracksHistory.restoreLastSong(), false);
      };
      /*
       * playSong
       * */
      this.playSong = function (song, saveToHistory) {
        // if there is current track, stop it from playing:
        $log.info('mbPlayerEngine: playSong: ' + song.metainfos.id + ' - ' + song.metainfos.getSongDescription());

        this.moveCurrentSongToHistory(song, saveToHistory);

        // TODO: Let it use play method
        bufferingNextSongAlreadyCalled = false; // for an init TODO: Refactor
        this.setCurrentSong(song);
        song.play();
        this.isPlaying = true; // TODO: Refactor

        // TODO: Refactor - set tab title to song name:
        window.document.title = song.metainfos.getSongDescription();

        return this.getCurrentSong().metainfos.id;
      };

      /* playlist */
      this.setPlaylist = function (playlist) {
        $log.info('mbPlayerEngine: set playlist...');
        $log.info(playlist);
        this.playlist = playlist;
        _playlist = playlist;

        // Pre-buffer first song:
        this.preBufferFirstSong();
      };
      this.getPlaylist = function (key) {
        if (_.isUndefined(key)) {
          if (_.isUndefined(_playlist)) _playlist = new (injector.get(['playlist']))();
          return _playlist;
        } else {
          return _playlist[key];
        }
      };
      this.addToPlaylist = function (entry) {
        this.getPlaylist().addEntry(entry)
        //broadcast playlist
        $rootScope.$broadcast('player=playlist', _playlist);
      };

      /* queue */
      this.pushNextSongToQueue = function (onLoadCallback) {
        $log.info('mbPlayerEngine: pushing new song to queue...');
        var _player = this;
        this.getPlaylist().getNext()
          .then(function (nextTrack) {
            songsRegistry[nextTrack.metainfos.id] = nextTrack;
            $log.info('mbPlayerEngine: Queue: new song in queue!');
            $log.info(nextTrack);
            _player.queue.enqueue(nextTrack);
            onLoadCallback(nextTrack);
            // Store song in registry:
          })
          .catch(function (response) {
            $log.warn('mbPlayerEngine: ..Queueing error!');
            $log.warn(response);
            _player.nextTrack(); // try to get next song
          });
      },

        /* track/song */
        this.setCurrentSong = function (song) {
          currentSong = song;
        };
      this.getCurrentSong = function () {
        return currentSong;
      };

      /* Proxy methods */
      this.getVolume = function () { return this.getCurrentSong().engine.getVolume(); };
      this.setVolume = function (vol) { return this.getCurrentSong().engine.setVolume(vol); };
      this.getPosition = function () { return this.getCurrentSong().engine.getPosition(); };
      this.setPosition = function (pos) {
        return this.getCurrentSong().seek(pos);
      };

      this.mute = function () { this.setVolume(0);};

      /* Helpers */
      this.moveCurrentSongToHistory = function (newSong, saveToHistory) {
        if (!_.isUndefined(this.getCurrentSong()) && this.getCurrentSong() !== newSong) {
          $log.info('mbPlayerEngine: stoping current track for playing new one (and add it to history)');
          if (_.isUndefined(saveToHistory) || saveToHistory === true)
            this.tracksHistory.storeSong(this.getCurrentSong());
          this.stop();
        }
      };
      this.updateSongBytesLoaded = function (songId) {
        //soundManager._writeDebug('sound '+this.id+' loading, '+this.bytesLoaded+' of '+this.bytesTotal);
        //broadcast track download progress:
        var evtSong = this.getSongById(songId);
        if (_.isUndefined(evtSong)) return;

        var progress = evtSong.getLoadedProgress();
        var evtSongInfos = {"bytesLoaded": progress[1], "bytesTotal": progress[2], "progress": progress[0]}
        var currentTrack = this.getCurrentSong();
        if (!_.isUndefined(currentTrack) && songId === currentTrack.metainfos.id)
          if (!$rootScope.$$phase) {
            $rootScope.$broadcast('currentTrack:bytesLoaded',
              evtSongInfos);
          }
        if (((!_.isUndefined(evtSongInfos.progress) && (evtSongInfos.progress ) >= 0.5 )
          || (!_.isUndefined(evtSongInfos.bytesLoaded) && (evtSongInfos.bytesLoaded / evtSongInfos.bytesTotal ) >= 0.5 ))
          && bufferingNextSongAlreadyCalled == false) {
          $log.info('mbPlayerEngine: loaded 99% of song, going to push new song in queue!');
          bufferingNextSongAlreadyCalled = true;
          if (!_queue.hasNext()) {
            mbPlayerEngineInstance.pushNextSongToQueue(function (song) {
              _queue.bufferNext();
            });
          } else {
            _queue.bufferNext();
          }
        }
      };
      this.removeCorruptedSong = function (songId) {
        if (this.getCurrentSong().metainfos.id === songId) {
          this.nextTrack(false); // don't save corrupted song to history.
        } else {
          this.queue.removeBySongId(songId);
        };
      };
    };

    var mbPlayerEngineInstance = new mbPlayerEngine();
    mbPlayerEngineInstance = _.extend(mbPlayerEngineInstance, {
      preBufferFirstSong: function () {
        _.delay(function () {
          mbPlayerEngineInstance.pushNextSongToQueue(function (song) {
            _queue.bufferNext();
          });
        }, 50);
      },
      /*
       * Init
       * */
      init: function () {
        initEngines();
        _.each(engines, function (engine) {
          if (!_.isUndefined(engine.init))
            engine.init(mbPlayerEngineInstance);
        });
      },
      /* events
       * (called by child player engines)
       *  */
      events: {
        onplay: function (songId) { mbPlayerEngineInstance.updateSongBytesLoaded(songId); },
        onerror: function (err) {
          $log.warn('mbPlayerEngine: error catched:"');
          $log.warn(err);
          mbPlayerEngineInstance.removeCorruptedSong(err.songId)
        },
        whileloading: function (songId) { mbPlayerEngineInstance.updateSongBytesLoaded(songId); },
        whileplaying: function () {
          var trackProgress = 0;
          if (!_.isUndefined(mbPlayerEngineInstance.getCurrentSong()))
            trackProgress = mbPlayerEngineInstance.getCurrentSong().getCurrentPosition()[0];
          if (!$rootScope.$$phase) {
            $rootScope.$broadcast('track:progress', trackProgress);
          }
        },
        onfinish: function () { mbPlayerEngineInstance.nextTrack(); }
      }
    });

    return mbPlayerEngineInstance;
  })
;
