'use strict';

angular.module('musicBucketEngine')
  .service('soundcloudApi', function ($http, $q) {

    var consumerKey = "8d84bbdf76bfc4a57c4996344cebbaf6"
    var soundcloudApiRequestQueryTimestamps = [];

    function soundcloudApiRequest(urlScheme, params, dontRunRequest) {
      /* Init */
      if (_.isUndefined(params.method)) params.method = "get";
      var deffered = $q.defer();
      this.promise = deffered.promise;
      /* Public */
      this.run = function () {
        var deffered = $q.defer();
        $http[params.method](this.buildUrl(urlScheme, params))
          .then(function (response) {
            deffered.resolve(response);
          }, function (error) {
            deffered.reject(error);
          });
        return deffered.promise;
      };

      this.buildUrl = function() {
        var urlParamRegex = /:(\w+)/g;
        var URL = getBaseUrl() + urlScheme.replace(urlParamRegex, urlParamInjector) + buildUrlGetParams();
        console.log("[soundcloudApi] Passed url: " + urlScheme);
        console.log("[soundcloudApi] Builded url: " + URL);
        return URL;
      };
      /* Private */

      (function addDefaultGetParams() {
        if (_.isUndefined(params.getParams)) params.getParams = {};
        params.getParams.consumer_key = consumerKey;
      })();

      function buildUrlGetParams() {
        // Add all get params to URL
        var getParams = "";
        if (!_.isUndefined(params.getParams)) {
          _.each(params.getParams, function (value, key) {
            if (!_.isUndefined(value)) {
              getParams += (getParams == "") ? "?" : "&";
              getParams += key + "=" + value;
            }
            ;
          });
        }
        return getParams;
      }

      function urlParamInjector(match, p1, offset, string) {
        return _.isUndefined(params[p1]) ? "" : params[p1];
      }

      function getBaseUrl() {
          return "https://api.soundcloud.com";
      }

      /* Running request is debounced by time
       *  Always min. 500ms after last one */
      var DEBOUNCE_TIME = 1000;

      function debounceRequest() {
        var lastTimestamp = _.last(soundcloudApiRequestQueryTimestamps);
        if (_.isUndefined(lastTimestamp)) lastTimestamp = 0;
        var waitTime = Math.max(0, -_.now() + (lastTimestamp )) + DEBOUNCE_TIME;
        var currentTimestamp = params.timestamp = _.now() + waitTime;
        console.log("[soundcloudApi] Request wait time:" + waitTime);
        soundcloudApiRequestQueryTimestamps.push(currentTimestamp);

        var self = this;
        _.delay(function () {
          self.run()
            .then(function (response) {
              deffered.resolve(response);
            }, function (error) {
              deffered.reject(error);
            });
          soundcloudApiRequestQueryTimestamps = _.reject(soundcloudApiRequestQueryTimestamps, function (timestamp) { return timestamp == params.timestamp;})
        }, waitTime);
      }
      if (!dontRunRequest)
        _.bind(debounceRequest, this)();

    }

    return {
      track : {
        // https://api.soundcloud.com/tracks/120682891/stream
        streamUrl : function(trackId) {
          return new soundcloudApiRequest('/tracks/:track_id/stream', {track_id: trackId}, true).buildUrl();
        }
      },
      // https://api.soundcloud.com/tracks.json?consumer_key=8d84bbdf76bfc4a57c4996344cebbaf6&q=flume&filter=all&order=hotness
      search: {
        track: function (query, limit, additionalFilters) {
          var params = additionalFilters || {};
          params = _.deepExtend(params, {getParams: {'q': query, 'limit': limit || 100, 'streamable' : true}});
          return new soundcloudApiRequest("/tracks.json", params).promise;
        }
      },
      station: {
        get: function (stationId) {
          return new soundcloudApiRequest("/station/:stationId", {'stationId': stationId}).promise;
        },
        next: function (stationId) {
          return new soundcloudApiRequest("/station/:stationId/next", {'stationId': stationId, proxy: true}).promise;
        },
        downvote: undefined,
        upvote: undefined,
        create: undefined,
        update: undefined,
        addSong: undefined,
        stationSong: undefined,
        release: undefined
      },
      artist: function (artistId) {

      },
      user: {}
    }
  });
