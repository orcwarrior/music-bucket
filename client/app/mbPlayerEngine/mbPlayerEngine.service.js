'use strict';

angular.module('musicBucketApp')
  .service('mbPlayerEngine', function ($rootScope, $log, $interval, playlist, queue, tracksHistory, angularPlayer, mbYoutubePlayer, playlistService, mbNotifications) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var injector = angular.injector(['musicBucketEngine']);
    var _playlist;
    var _queue = new injector.get('queue').constructor();
    var currentSong = undefined;

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

    var mobileHTML5 = undefined;

    function _isMobileHTML5() {
      // based on SM2 functionality;
      if (!_.isUndefined(mobileHTML5)) return mobileHTML5;
      var ua = navigator.userAgent,
        is_iDevice = ua.match(/(ipad|iphone|ipod)/i), isAndroid = ua.match(/android/i), isIE = ua.match(/msie/i);
      mobileHTML5 = (ua.match(/(mobile|pre\/|xoom)/i) || is_iDevice || isAndroid);
      return mobileHTML5;
    }

    /* mbPlayerEngine */
    function mbPlayerEngine() {
      var self = this;
      var bufferingNextSongAlreadyCalled = false;
      var songsRegistry = {}; // song registy, key: $songId, val: songObj
      this.isPlaying = false;
      this.isWorking = false; // for graphical information that somethings happen with a player :)
      this.debouncedTurnOffIsWorking = _.debounce(function () {
        this.setIsWorking(false);
      }, 3000);

      this.setIsWorking = function (working) {
        this.isWorking = working; //working; // TEMPORARY
        if (working) this.debouncedTurnOffIsWorking();
        $rootScope.$broadcast('player:working', this.isWorking);
      };

      this.playlist = _playlist;
      this.queue = _queue;
      this.tracksHistory = new tracksHistory();

      this.getSongById = function (id) {
        var curSong = this.getCurrentSong();
        if (!_.isUndefined(curSong) && curSong.metainfos.id === id) return curSong;
        var queueSong = this.queue.getSongById(id);
        if (!_.isUndefined(queueSong)) return queueSong;
        var historySong = this.tracksHistory.getSongById(id);
        if (!_.isUndefined(historySong)) return historySong;
      };
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
          if (!this.queue.hasItems()) {
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
        __beginingPlaylistId = this.getPlaylist().id;
        if (this.isPlaying) {
          this.pause();
          $interval.cancel(__playlistAdvancerInterval);
        }
        else {
          this.play();
          __playlistAdvancerInterval = $interval(_playlistTimerAdvancer, 60 * 1000);
        }
      };
      /*
       * nextTrack
       * */
      this.nextTrack = function (saveToHistory) {
        $log.info('mbPlayerEngine: Next track...');
        var _player = this;
        // run playlist sequence event:
        this.getPlaylist().playlistSequencer.songChange();

        // Get next song from queue:
        if (!this.queue.hasItems()) {
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

        // store playlist cookie:
        this.getPlaylist().storeInLocalstorage();
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

        if (!this.getPlaylist().validateSong(song)) {
          // TODO: Extract
          mbNotifications.notify('Skipped song: ' + (song.metainfos && song.metainfos.getSongDescription()));
          return this.nextTrack(false); // skip to next
        }

        // TODO: Let it use play method
        bufferingNextSongAlreadyCalled = false; // for an init TODO: Refactor
        this.setCurrentSong(song);

        song.play();
        this.isPlaying = true; // TODO: Refactor

        // TODO: Refactor - set tab title to song name:
        window.document.title = song.metainfos.getSongDescription();
        mbPlayerEngineInstance.fireEvent("songChange", song);

        var self = this;
        song.engine.listen("onsongready", function (observable, eventType, data) {
          window.document.title = song.metainfos.getSongDescription();
          mbPlayerEngineInstance.fireEvent("songChange", song);
          // FIX: Keep all volumes synced: (DOESNT WORK ANYWAYS)
          self.setVolume(self._volume);
        });

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
        $rootScope.$broadcast('playlist:update', playlist);
        mbNotifications.notify('Playlist "'+playlist.name+'" is ready to play!');
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
        if (_.isUndefined(entry) || _.isNull(entry))
          return $log.warn("mbPlayerEngine: tried to add null/undef to playlist!");
        this.getPlaylist().addEntry(entry);
        //broadcast playlist
        $rootScope.$broadcast('player=playlist', _playlist);
      };

      /* queue */
      this.queueSong = function (song) {
        $log.info('mbPlayerEngine: Queue: new song in queue!');
        $log.info(song);
        // songsRegistry[song.metainfos.id] = song;
        this.queue.enqueue(song);
      };
      this.queueSongNext = function (song) {
        $log.info('mbPlayerEngine: Queue: new song in queue (play-next)!');
        $log.info(song);
        // songsRegistry[song.metainfos.id] = song;
        this.queue.enqueueNext(song);
      };
      this.pushNextSongToQueue = function (onLoadCallback) {
        if (this.getPlaylist().isEmpty()) return;
        $log.info('mbPlayerEngine: pushing new song to queue...');
        var _player = this;
        if (!this.isPlaying)
          this.setIsWorking(true);

        this.getPlaylist().getNext()
          .then(function (nextSong) {
            if (!_player.getPlaylist().validateSong(nextSong)) {
              // notify warn: skipping banned song: song
              mbNotifications.notify('Skipped song: ' + (nextSong.metainfos && nextSong.metainfos.getSongDescription()));
              return _player.pushNextSongToQueue(onLoadCallback);
            }

            _player.queueSong(nextSong);
            onLoadCallback(nextSong);

            if (nextSong.isBuffered()) _player.setIsWorking(false);
            else {
              nextSong.engine.listen("onsongready", function (observable, eventType, data) {
                $log.info('mbPlayerEngine: onsongready handler called on: ' + nextSong.id);
                _player.setIsWorking(false);
              });
            }
            // Store song in registry:
          })
          .catch(function (response) {
            $log.warn('mbPlayerEngine: ..Queueing error! (try queue another)');
            $log.warn(response);
            // retry:
            _.delay(_.bind(_player.pushNextSongToQueue, _player, onLoadCallback), 250);
            _player.setIsWorking(false);
          });
      },
        this.clearQueue = function () {
          this.queue.clear();
          this._queueCleared = true;
        }

      /* track/song */
      this.setCurrentSong = function (song) {
        currentSong = song;
      };
      this.getCurrentSong = function () {
        if (!_.isUndefined(currentSong) && !_.isUndefined(currentSong.usedAlt)) return currentSong.usedAlt;
        return currentSong;
      };

      /* Proxy methods */
      this._volume = 100;
      this.getVolume = function () {
        if (_.isUndefined(this.getCurrentSong())) return 0;
        return this.getCurrentSong().engine.getVolume();
      };
      this.setVolume = function (vol) {
        this._volume = vol;
        if (_.isUndefined(this.getCurrentSong())) return;
        return this.getCurrentSong().engine.setVolume(vol);
      };
      this.getPosition = function () {
        return this.getCurrentSong().engine.getPosition();
      };
      this.setPosition = function (pos) {
        return this.getCurrentSong().seek(pos);
      };

      this.mute = function () {
        this.setVolume(0);
      };

      /* Helpers */
      this.moveCurrentSongToHistory = function (newSong, saveToHistory) {
        if (!_.isUndefined(this.getCurrentSong()) && this.getCurrentSong() !== newSong) {
          // fire song "onfinish" event:
          this.getCurrentSong().engine.fireEvent("onfinish", {song: this.getCurrentSong(), skipped: false});

          $log.info('mbPlayerEngine: stoping current track for playing new one (and add it to history)');
          if (_.isUndefined(saveToHistory) || saveToHistory === true)
            this.tracksHistory.storeSong(this.getCurrentSong());
          this.stop();
        }
      };
      this.updateSongBytesLoaded = function (songId) {

        //broadcast track download progress:
        var evtSong = this.getSongById(songId);
        if (_.isUndefined(evtSong)) return;

        var progress = evtSong.getLoadedProgress();

        var evtSongInfos;
        if (_.isUndefined(progress)) evtSongInfos = {"bytesLoaded": 0, "bytesTotal": 1, "progress": 0};
        else evtSongInfos = {"bytesLoaded": progress[1], "bytesTotal": progress[2], "progress": progress[0]};

        var currentTrack = this.getCurrentSong();
        if (!_.isUndefined(currentTrack) && songId === currentTrack.metainfos.id)
          if (!$rootScope.$$phase) {
            $rootScope.$broadcast('currentTrack:bytesLoaded',
              evtSongInfos);
          }

        // NOTE: On mobile SM2 will run in global HTML5 Audio instance file so further queueing
        // has to be disabled on them.
        if (_isMobileHTML5()) return;
        if (((!_.isUndefined(evtSongInfos.progress) && (evtSongInfos.progress ) >= 0.5 )
          || (!_.isUndefined(evtSongInfos.bytesLoaded) && (evtSongInfos.bytesLoaded / evtSongInfos.bytesTotal ) >= 0.5 ))
          && bufferingNextSongAlreadyCalled == false) {
          $log.info('mbPlayerEngine: loaded 50% of song, going to push new song in queue!');
          bufferingNextSongAlreadyCalled = true;
          if (!_queue.hasItems()) {
            mbPlayerEngineInstance.pushNextSongToQueue(function (song) {
              _queue.bufferNext();
            });
          } else {
            _queue.bufferNext();
          }
        }
      };
      this.removeCorruptedSong = function (songId) {
        if (this.getCurrentSong() && this.getCurrentSong().metainfos.id === songId) {
          this.nextTrack(false); // don't save corrupted song to history.
        } else {
          this.queue.removeBySongId(songId);
        }
      };
      this.clearPlaylist = function () {
        _.bind(this.getPlaylist().clear, this.getPlaylist())();
      }

      /* private */
      var __beginingPlaylistId;
      var __playlistAdvancerInterval;
      var _playlistTimerAdvancer = function () {
        if (mbPlayerEngineInstance.getPlaylist().id === __beginingPlaylistId)
          playlistService.advanceTimer(mbPlayerEngineInstance.getPlaylist().id);
        __beginingPlaylistId = mbPlayerEngineInstance.getPlaylist().id;
        console.log("Playlist: advance timer...");
      }
    };

    // Make it observable:
    mbPlayerEngine.prototype = new observable();

    var mbPlayerEngineInstance = new mbPlayerEngine();
    mbPlayerEngineInstance = _.extend(mbPlayerEngineInstance, {
      preBufferFirstSong: function () {
        _.delay(function () {
          mbPlayerEngineInstance.pushNextSongToQueue(function (song) {
            // song.engine.listen("onsongready", function(observable) {
            //   mbPlayerEngineInstance.playSong(song, false);
            // })
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
      // Entry based controlls:
      entryPlay: function (entry, songId) {
        mbPlayerEngineInstance.setIsWorking(true);
        if (_.isFunction(entry.getNext)) {
          entry.getNext({force: true, 'songId': songId})
            .then(function (song) {
              mbPlayerEngineInstance.playSong(song, true);
              mbPlayerEngineInstance.playlist.storeInLocalstorage();
              song.engine.listen("onsongready", function (observable, eventType, data) {
                mbPlayerEngineInstance.setIsWorking(false);
              });
            });
        }
      },
      entryPlayNext: function (entry, songId) {
        mbPlayerEngineInstance.setIsWorking(true);
        if (_.isFunction(entry.getNext)) {
          entry.getNext({force: true, 'songId': songId})
            .then(function (song) {
              mbPlayerEngineInstance.queue.enqueueNext(song);
              mbPlayerEngineInstance.playlist.storeInLocalstorage();
              mbPlayerEngineInstance.setIsWorking(false);
            });
        }
      },
      entryEnqueue: function (entry, songId) {
        mbPlayerEngineInstance.setIsWorking(true);
        if (_.isFunction(entry.getNext)) {
          entry.getNext({force: true, 'songId': songId})
            .then(function (song) {
              mbPlayerEngineInstance.queue.enqueue(song);
              mbPlayerEngineInstance.playlist.storeInLocalstorage();
              mbPlayerEngineInstance.setIsWorking(false);
            });
        }
      },
      /* events
       * (called by child player engines)
       *  */
      events: {
        onplay: function (songId) {
          mbPlayerEngineInstance.updateSongBytesLoaded(songId);
        },
        onerror: function (err) {
          $log.warn('mbPlayerEngine: error catched:"');
          $log.warn(err);
          mbPlayerEngineInstance.removeCorruptedSong(err.songId)
        },
        whileloading: function (songId) {
          mbPlayerEngineInstance.updateSongBytesLoaded(songId);
        },
        whileplaying: function () {
          var trackProgress = 0;
          if (!_.isUndefined(mbPlayerEngineInstance.getCurrentSong()))
            trackProgress = mbPlayerEngineInstance.getCurrentSong().getCurrentPosition()[0];
          if (!$rootScope.$$phase) {
            $rootScope.$broadcast('track:progress', trackProgress);
          }
        },
        onfinish: function () {
          // fire song "onfinish" event:
          if (!_.isUndefined(mbPlayerEngineInstance.getCurrentSong()))
            mbPlayerEngineInstance.getCurrentSong().engine.fireEvent("onfinish", {
              song: mbPlayerEngineInstance.getCurrentSong(),
              skipped: false
            });
          mbPlayerEngineInstance.nextTrack();
        }
      },

      /* Theater Mode
       * */
      theaterMode: {
        enabled: false,
        playlistMenuToggled: true,
        idle: false
      },
    });

    return mbPlayerEngineInstance;
  })
;
