'use strict';

angular.module('musicBucketEngine')
  .factory('mbYoutubePlayer', function ($log, playbackError, playbackErrorTypes) {

    function mbYoutubePlayer() {
      var self = this;
      var mbPlayerEngine;
      var inFullscreenMode = false;
      var players = [];
      var playersReady = {};
      var PLAYER_STATES = {
        "UNSTARTED": -1,
        "ENDED": 0,
        "PLAYING": 1,
        "PAUSED": 2,
        "BUFFERING": 3,
        "VIDEO_CUED": 5
      };
      function stateIdToName(id) {
        var key;
        _.each(_.keys(PLAYER_STATES), function (k) {
          if (PLAYER_STATES[k] === id)
            key = k;
        });
        return key;
      }

      var ERROR_STATUSES = {
        "WRONG_PARAMETER": 2,
        "FILM_NOT_FOUND": 100,
        "FILM_CANNOT_BE_EMBEDED": 101
      };

      /* privates */
      function bufferingListener(event) {
        if (event.data === PLAYER_STATES.PLAYING) {
          var vidId = getPlayerVideoId(event.target);
          $log.info(buildLogMsg(event.target, "pre-buffering finalized, calling callback, seek and stuff :)"));
          // Ok, so vid just starts to play, stop it right now, and remove this listener:

          if (!event.target.__ytEngineUtils.callPlayAfterPrebuffering)
            self.pause(vidId); // play already called so play video right now!
          self.unmute(vidId);
          self.seek(vidId, 0);
          event.target.__ytEngineUtils.additionalOnStateChangeCallback = _.noop;
          event.target.__ytEngineUtils.isBuffered = vidId;
          // Call callback function for this video:
          event.target.__ytEngineUtils.onBufferCb(event);
          event.target.__ytEngineUtils.isPrebuffering = false;
        }
      }

      var videoToPlayerMap = {};

      function getPlayerWithVideo(videoId) {

        _.each(players, function (player) {
          if (getPlayerVideoId(player) === videoId)
            return player;
        });
      };

      function getFreePlayer() {
        var selectedPlayer;
        _.each(players, function (player) {
          var state;
          if (_.isFunction(player.getPlayerState))
            state = player.getPlayerState();
          if (state === PLAYER_STATES.ENDED || state == PLAYER_STATES.UNSTARTED)
            selectedPlayer = player;
        });
        if (_.isUndefined(selectedPlayer)) {
          _.each(players, function (player) {
            var state;
            if (_.isFunction(player.getPlayerState))
              state = player.getPlayerState();
            if (state === PLAYER_STATES.VIDEO_CUED || state == PLAYER_STATES.PAUSED)
              selectedPlayer = player;
          });
        }
        ;
        return selectedPlayer;
      }

      function selectPlayer(videoId) {
        if (!_.isUndefined(videoToPlayerMap[videoId])) {
          // $log.info(buildLogMsg(videoToPlayerMap[videoId], " picked(map) for: "+videoId));
          return videoToPlayerMap[videoId];
        }

        var player = getPlayerWithVideo(videoId);
        if (_.isUndefined(player))
          player = getFreePlayer();

        // filter all videos that used just picked player (except just added videoId)
        videoToPlayerMap[videoId] = player;
        var filteredMap = {};
        _.each(videoToPlayerMap, function (val, key) {
          if ((key === videoId && val === player) || val !== player)
            filteredMap[key] = val;
        });
        videoToPlayerMap = filteredMap;
        $log.info(buildLogMsg(player, " picked for: "+videoId));

        return player;
      }

      function getPlayerVideoId(player) {
        if (!_.isUndefined(player.getVideoData) && _.isFunction(player.getVideoData) && !_.isUndefined(player.getVideoData()))
          return player.getVideoData().video_id;
        else return "ERROR";
      };
      function getPlayerId(videoId) {
        var el = getMyPlayerParentElement(videoId);
        if (_.isNull(el) || _.isUndefined(el.id)) return "UNKNPLAYER";
        else return el.id;
      }

      function getMyPlayerParentElement(videoId) {
        var player = videoToPlayerMap[videoId]; // otherwise fuck u!
        if (_.isUndefined(player)) return null;
        return player.h;
      }

      function extendPlayerByEngineUtils(player) {
        if (!_.isUndefined(player.__ytEngineUtils)) {
          console.warn("player already has engine utils, probably added to ytEngine before!");
          return false;
        } else {
          player.__ytEngineUtils = {
            isPrebuffering: false,
            callPlayAfterPrebuffering: false,
            isBuffered: false,
            onBufferCb: _.noop,
            additionalOnStateChangeCallback: _.noop,
            lastLoadedFraction: 0,
            secondIntevalCallback: function () {
              // $log.info(" callback...");
              if (!_.isUndefined(player.getVideoLoadedFraction) && this.lastLoadedFraction !== player.getVideoLoadedFraction()) {
                // $log.info(" progress update");
                mbPlayerEngine.events.whileloading(getPlayerVideoId(player));
                this.lastLoadedFraction = player.getVideoLoadedFraction();
              }
              if (!_.isUndefined(player.getPlayerState) && player.getPlayerState() === PLAYER_STATES.PLAYING)
              // $log.info(" play pos update");
                mbPlayerEngine.events.whileplaying(getPlayerVideoId(player));
              // call again after delay:
              _.delay(_.bind(this.secondIntevalCallback, this), 1000);
            },
            reinit: function () {
              this.isPrebuffering = false;
              this.callPlayAfterPrebuffering = false;
              this.isBuffered = false;
              this.onBufferCb = _.noop;
              this.additionalOnStateChangeCallback = _.noop;
              this.lastLoadedFraction = 0;
            }
          };
          _.bind(player.__ytEngineUtils.secondIntevalCallback, player.__ytEngineUtils)();
          return true;
        }
      }

      function buildLogMsg(player, msg) {
        if (_.isUndefined(player)) return "YTPlayer(UNKNOWN): UNKNOWN " + msg;
        return "YTPlayer(" + player.h.id+ "): " + getPlayerVideoId(player) + " " + msg;
      }

      /* Public */
      this.init = function (baseEngine) {
        $log.info("YTPlayer: init...");
        mbPlayerEngine = baseEngine;
      };

      /* Controlls*/
      this.play = function (videoId, onBufferedCb) {
        var dstPlayer = selectPlayer(videoId);
        $log.info(buildLogMsg(dstPlayer, "playing..."));
        // Is new video? then reinit:
        if (getPlayerVideoId(dstPlayer) !== videoId) dstPlayer.__ytEngineUtils.reinit();

        // Video could be actually in pre-buffering state:
        if (dstPlayer && dstPlayer.__ytEngineUtils.isPrebuffering)
          dstPlayer.__ytEngineUtils.callPlayAfterPrebuffering = true;
        else if (this.isBuffered(videoId))
          dstPlayer.playVideo();
        else {
          dstPlayer.loadVideoById(videoId);
          dstPlayer.__ytEngineUtils.onBufferCb = onBufferedCb || _.noop;
        }
      };
      this.isBuffered = function (videoId) {
        var result = false, dstPlayer = undefined;
        _.each(players, function(player) {
          if (player.__ytEngineUtils.isBuffered === videoId) {
            result = true;
            dstPlayer = player;
          }
        });
        // $log.info(buildLogMsg(dstPlayer, "isBuffered: " + result));
        return result;
      };
      this.buffer = function (videoId, onBufferedCb) {
        if (this.isBuffered(videoId)) {
          $log.info(buildLogMsg(videoId, "buffer: is already buffered!"));
          return;
        }
        var dstPlayer = selectPlayer(videoId);
        $log.info(buildLogMsg(dstPlayer, "buffer: "+videoId));
        if (_.isUndefined(dstPlayer)
          || dstPlayer.__ytEngineUtils.isPrebuffering) return;
        dstPlayer.loadVideoById(videoId);
        dstPlayer.mute(); // BUGFIX: Calling mute on this, when videoID isn'y still there, calls mute on another player :(
        dstPlayer.__ytEngineUtils.reinit();
        dstPlayer.__ytEngineUtils.additionalOnStateChangeCallback = bufferingListener;
        dstPlayer.__ytEngineUtils.onBufferCb = onBufferedCb || _.noop;
        dstPlayer.__ytEngineUtils.isPrebuffering = true;
        dstPlayer.__ytEngineUtils.isBuffered = false;
      };
      this.stop = function (videoId) {
        var dstPlayer = selectPlayer(videoId);
        $log.info(buildLogMsg(dstPlayer, "stop"));
        // bugfix: stop only when player is actually in playing state:
        if (dstPlayer.getPlayerState() === PLAYER_STATES.PLAYING) {
          dstPlayer.pauseVideo();
          this.seek(videoId, 0);
        }
      };
      this.pause = function (videoId) {
        var dstPlayer = selectPlayer(videoId);
        dstPlayer.pauseVideo();
        $log.info(buildLogMsg(dstPlayer, "pause"));
      };
      this.mute = function (videoId) {
        var dstPlayer = selectPlayer(videoId);
        $log.info(buildLogMsg(dstPlayer, "mute"));
        dstPlayer.mute();
      };
      this.unmute = function (videoId) {
        var dstPlayer = selectPlayer(videoId);
        $log.info(buildLogMsg(dstPlayer, "unmute"));
        dstPlayer.unMute();
      };
      this.setVolume = function (videoId, vol) {
        var dstPlayer = selectPlayer(videoId);
        $log.info(buildLogMsg(dstPlayer, "setVolume: " + vol));
        dstPlayer.setVolume(vol);
      };
      this.seek = function (videoId, posSec) {
        var dstPlayer = selectPlayer(videoId);
        $log.info(buildLogMsg(dstPlayer, "seek: " + posSec));
        dstPlayer.seekTo(posSec);
        // update playing position:
        mbPlayerEngine.events.whileplaying(videoId);
      };
      this.getDuration = function (videoId) {
        var dstPlayer = selectPlayer(videoId);
        if (_.isUndefined(dstPlayer)) return -1;
        //$log.info(this.getPlayerId(videoId) + ": "+videoId+" getDuration: "+selectPlayer(videoId).getDuration());
        return selectPlayer(videoId).getDuration();
      };
      this.getLoadedProgress = function (videoId) {
        //$log.info(this.getPlayerId(videoId) + ": "+videoId+" getLoadedProgress: "+selectPlayer(videoId).getVideoLoadedFraction());
        var player = selectPlayer(videoId);
        if (_.isUndefined(player) || !_.isFunction(player.getVideoLoadedFraction)) return 0;

        return player.getVideoLoadedFraction();
      };
      this.getCurrentPosition = function (videoId) {
        //$log.info(this.getPlayerId(videoId) + ": "+videoId+" getCurrentPosition: "+selectPlayer(videoId).getCurrentTime());
        return selectPlayer(videoId).getCurrentTime();
      };

      /* Utils */
      this.getInfos = function (videoId) {
        var player = selectPlayer(videoId);
        if (_.isUndefined(player))
          return "PLAYER_NOT_INITIALIZED_VIDEO";
        else
          return player.getVideoData();
      };
      this.getMyPlayerParentElement = function (videoId) {
        return getMyPlayerParentElement(videoId);
      };
      this.setFullscreen = function (videoId, fullscreen) {
        $log.info(buildLogMsg(videoId, "setFullscreen: " + fullscreen));
        var wrapperEl = this.getMyPlayerParentElement(videoId);
        inFullscreenMode = fullscreen;
        if (fullscreen) {
          var requestFullScreen = wrapperEl.requestFullScreen || wrapperEl.mozRequestFullScreen || wrapperEl.webkitRequestFullScreen;
          if (requestFullScreen) {
            requestFullScreen.bind(wrapperEl)();
            $log.info(buildLogMsg(videoId, " ...entered fullscreen"));
          }
        }
        else {
          var exitFullScreen = wrapperEl.exitFullscreen || wrapperEl.mozCancelFullScreen || wrapperEl.msExitFullscreen;
          if (exitFullScreen) {
            exitFullScreen.bind(wrapperEl)();
            $log.info(buildLogMsg(videoId, " ... fullscreen exited"));
          }
        }
      };

      this.addPlayer = function (player) {
        $log.info("YTPlayer: added player: "+player.h.id);
        extendPlayerByEngineUtils(player);
        players.push(player);
        playersReady[player.h.id] = false; // change when onready called
      };
      this.isReady = function () {
        return _.some(playersReady); // all vals truthy?
      }
      /* events handlers */
      this.onready = function (player, event) {
        $log.info(buildLogMsg(player, "onready called by player: " + player.h.id));
        playersReady[player.h.id] = true;
      };
      this.onerror = function (player, event) {
        $log.warn(buildLogMsg(player, "error!: " + event.data));
        player.__ytEngineUtils.reinit();
        mbPlayerEngine.events.onerror(new playbackError(playbackErrorTypes.youtube, getPlayerVideoId(player), event.data));
      };
      this.onplay = function (player, event) {
        // Call buffer callback if video wasn't prebuffered (just played)
        if (event.target.__ytEngineUtils.isBuffered) return;

        event.target.__ytEngineUtils.isBuffered = getPlayerVideoId(player);
        // Call callback function for this video:
        event.target.__ytEngineUtils.onBufferCb(event);
        // BUGFIX: Set initial volume to 100
        player.unMute();
      }
      this.onplayerinit = function (player, event) {
        $log.info(buildLogMsg(player, "onplayerinit called by: " + player));
        // BUGFIX: Set initial volume to 100
        player.unMute();
      }
      this.onstatechange = function (player, event) {
        $log.info(buildLogMsg(player, "state changed: " + stateIdToName(event.data)));
        if (event.data === PLAYER_STATES.UNSTARTED) {
          this.onplayerinit(player, event);
        }
        if (event.data === PLAYER_STATES.PLAYING) {
          this.onplay(player, event);
          mbPlayerEngine.events.onplay(getPlayerVideoId(player));
        }
        else if (event.data === PLAYER_STATES.ENDED) {
          // this.setFullscreen(getPlayerVideoId(player), false); // exit from fullscreen
          mbPlayerEngine.events.onfinish();
        }
        player.__ytEngineUtils.additionalOnStateChangeCallback(event);
      }
    }

    return new mbYoutubePlayer();
  })
;
