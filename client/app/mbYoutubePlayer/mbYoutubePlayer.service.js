'use strict';

angular.module('musicBucketEngine')
  .factory('mbYoutubePlayer', function ($log, playbackError, playbackErrorTypes) {

    function mbYoutubePlayer() {
      var mbPlayerEngine;
      var inFullscreenMode = false;
      var players = [];
      var PLAYER_STATES = {
        "UNSTARTED": -1,
        "ENDED": 0,
        "PLAYING": 1,
        "PAUSED": 2,
        "BUFFERING": 3,
        "VIDEO_CUED": 5
      };
      var ERROR_STATUSES = {
        "WRONG_PARAMETER": 2,
        "FILM_NOT_FOUND": 100,
        "FILM_CANNOT_BE_EMBEDED": 101
      };

      /* privates */
      function bufferingListener(event) {
        if (event.data === PLAYER_STATES.PLAYING) {
          $log.info("YTPlayer: " + getPlayerVideoId(event.target) + " pre-buffering finalized, calling callback, seek and stuff :)");
          // Ok, so vid just starts to play, stop it right now, and remove this listener:

          if (!event.target.__ytEngineUtils.callPlayAfterPrebuffering)
            event.target.pauseVideo(); // play already called so play video right now!
          event.target.unMute();
          event.target.seekTo(0);
          event.target.__ytEngineUtils.additionalOnStateChangeCallback = _.noop;
          event.target.__ytEngineUtils.isBuffered = true;
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
        if (!_.isUndefined(videoToPlayerMap[videoId])) return videoToPlayerMap[videoId]

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
        return player;
      }

      function getPlayerVideoId(player) {
        if (!_.isUndefined(player.getVideoData) && _.isFunction(player.getVideoData) && !_.isUndefined(player.getVideoData()))
          return player.getVideoData().video_id;
        else return "ERROR";
      };
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
              // $log.info("YTPlayer: "+getPlayerVideoId(player)+" callback...");
              if (!_.isUndefined(player.getVideoLoadedFraction) && this.lastLoadedFraction !== player.getVideoLoadedFraction()) {
                // $log.info("YTPlayer: "+getPlayerVideoId(player)+" progress update");
                mbPlayerEngine.events.whileloading(getPlayerVideoId(player));
                this.lastLoadedFraction = player.getVideoLoadedFraction();
              }
              if (!_.isUndefined(player.getPlayerState) && player.getPlayerState() === PLAYER_STATES.PLAYING)
              // $log.info("YTPlayer: "+getPlayerVideoId(player)+" play pos update");
                mbPlayerEngine.events.whileplaying(getPlayerVideoId(player));
              // call again after delay:
              _.delay(_.bind(this.secondIntevalCallback, this), 1000);
            },
            reinit : function() {
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

      this.init = function (baseEngine) {
        $log.info("YTPlayer: init...");
        mbPlayerEngine = baseEngine;
      };

      /* Controlls*/
      this.play = function (videoId) {
        $log.info("YTPlayer: " + videoId + " playing...");
        var dstPlayer = selectPlayer(videoId);
        // Video could be actually in pre-buffering state:
        if (dstPlayer && dstPlayer.__ytEngineUtils.isPrebuffering)
          dstPlayer.__ytEngineUtils.callPlayAfterPrebuffering = true;
        else if (this.isBuffered(videoId))
          dstPlayer.playVideo();
        else
          dstPlayer.loadVideoById(videoId);
      };
      this.isBuffered = function (videoId) {
        var dstPlayer = selectPlayer(videoId);
        if (_.isUndefined(dstPlayer)) return;
        $log.info("YTPlayer: " + videoId + " isBuffered: " + dstPlayer.__ytEngineUtils.isBuffered);
        return dstPlayer.__ytEngineUtils.isBuffered && getPlayerVideoId(dstPlayer) === videoId;
      };
      this.buffer = function (videoId, onBufferedCb) {
        $log.info("YTPlayer: " + videoId + " buffer...");
        if (this.isBuffered(videoId)) {
          $log.info("YTPlayer: " + videoId + " is already buffered!");
          return;
        }
        var dstPlayer = selectPlayer(videoId);
        if (_.isUndefined(dstPlayer)
        || dstPlayer.__ytEngineUtils.isPrebuffering) return;
        dstPlayer.loadVideoById(videoId);
        this.mute(videoId);
        dstPlayer.__ytEngineUtils.reinit();
        dstPlayer.__ytEngineUtils.additionalOnStateChangeCallback = bufferingListener;
        dstPlayer.__ytEngineUtils.onBufferCb = onBufferedCb || _.noop;
        dstPlayer.__ytEngineUtils.isPrebuffering = true;
        dstPlayer.__ytEngineUtils.isBuffered = false;
      };
      this.stop = function (videoId) {
        $log.info("YTPlayer: " + videoId + " stop");
        var dstPlayer = selectPlayer(videoId);
        // bugfix: stop only when player is actually in playing state:
        if (dstPlayer.getPlayerState() === PLAYER_STATES.PLAYING) {
          dstPlayer.pauseVideo();
          this.seek(videoId, 0);
        }
      };
      this.pause = function (videoId) {
        $log.info("YTPlayer: " + videoId + " pause");
        selectPlayer(videoId).pauseVideo();
      };
      this.mute = function (videoId) {
        $log.info("YTPlayer: " + videoId + " mute");
        selectPlayer(videoId).mute();
      };
      this.unmute = function (videoId) {
        $log.info("YTPlayer: " + videoId + " unMute");
        selectPlayer(videoId).unMute();
      };
      this.pause = function (videoId) {
        $log.info("YTPlayer: " + videoId + " pause");
        selectPlayer(videoId).pauseVideo();
      };
      this.setVolume = function (videoId, vol) {
        $log.info("YTPlayer: " + videoId + " setVolume: " + vol);
        selectPlayer(videoId).setVolume(vol);
      };
      this.seek = function (videoId, posSec) {
        $log.info("YTPlayer: " + videoId + " seek: " + posSec);
        selectPlayer(videoId).seekTo(posSec);
        // update playing position:
        mbPlayerEngine.events.whileplaying(videoId);
      };
      this.getDuration = function (videoId) {
        var dstPlayer = selectPlayer(videoId);
        if (_.isUndefined(dstPlayer)) return -1;
        //$log.info("YTPlayer: "+videoId+" getDuration: "+selectPlayer(videoId).getDuration());
        return selectPlayer(videoId).getDuration();
      };
      this.getLoadedProgress = function (videoId) {
        //$log.info("YTPlayer: "+videoId+" getLoadedProgress: "+selectPlayer(videoId).getVideoLoadedFraction());
        return selectPlayer(videoId).getVideoLoadedFraction();
      };
      this.getCurrentPosition = function (videoId) {
        //$log.info("YTPlayer: "+videoId+" getCurrentPosition: "+selectPlayer(videoId).getCurrentTime());
        return selectPlayer(videoId).getCurrentTime();
      };
      this.getInfos = function (videoId) {
        var player = selectPlayer(videoId);
        if (_.isUndefined(player))
          return "PLAYER_NOT_INITIALIZED_VIDEO";
        else
          return player.getVideoData();
      };
      this.getMyPlayerParentElement = function (videoId) {
        var player = selectPlayer(videoId);
        if (_.isUndefined(player)) return null;
        return player.h;
      }
      this.setFullscreen = function (videoId, fullscreen) {
        $log.info("YTPlayer: " + videoId + " setFullscreen: " + fullscreen);
        var wrapperEl = this.getMyPlayerParentElement(videoId);
        inFullscreenMode = fullscreen;
        if (fullscreen) {
          var requestFullScreen = wrapperEl.requestFullScreen || wrapperEl.mozRequestFullScreen || wrapperEl.webkitRequestFullScreen;
          if (requestFullScreen) {
            requestFullScreen.bind(wrapperEl)();
            $log.info("YTPlayer: " + videoId + " ...entered fullscreen");
          }
        }
        else {
          var exitFullScreen = wrapperEl.exitFullscreen || wrapperEl.mozCancelFullScreen || wrapperEl.msExitFullscreen;
          if (exitFullScreen) {
            exitFullScreen.bind(wrapperEl)();
            $log.info("YTPlayer: " + videoId + " ... fullscreen exited");
          }
        }
      };

      this.addPlayer = function (player) {
        $log.info("YTPlayer: add plauyer");
        extendPlayerByEngineUtils(player);
        players.push(player);
      };

      /* events handlers */
      this.onready = function (player, event) {
        console.log("onready called by player: " + player);
      };
      this.onerror = function (player, event) {
        player.__ytEngineUtils.reinit();
        mbPlayerEngine.events.onerror(new playbackError(playbackErrorTypes.youtube, getPlayerVideoId(player), event.data));
      };
      this.onstatechange = function (player, event) {
        $log.info("YTPlayer: " + getPlayerVideoId(player) + " state changed: " + event.data);
        if (event.data === PLAYER_STATES.PLAYING) {
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
