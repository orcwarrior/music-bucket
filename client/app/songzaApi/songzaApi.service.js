'use strict';

angular.module('musicBucketEngine')
  .service('songzaApi', function ($http, $q) {

    var songzaApiRequestQueryTimestamps = [];

    function songzaApiRequest(urlScheme, params) {
      /* Init */
      if (_.isUndefined(params.method)) params.method = "get";
      var deffered = $q.defer();
      this.promise = deffered.promise;
      /* Public */
      this.run = function () {
        var deffered = $q.defer();
        $http[params.method](buildUrl(urlScheme, params))
          .then(function (response) {
            deffered.resolve(response);
          }, function (error) {
            deffered.reject(error);
          });
        return deffered.promise;
      }

      /* Private */
      function buildUrl(urlScheme) {
        var urlParamRegex = /:(\w+)/g;
        var URL = getBaseUrl() + urlScheme.replace(urlParamRegex, urlParamInjector) + buildUrlGetParams();
        console.log("[songzaApi] Passed url: " + urlScheme);
        console.log("[songzaApi] Builded url: " + URL);
        return URL;
      }

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
        if (params.proxy && window.location.href.indexOf("localhost") != -1)
          return "http://localhost:9001/songza-api-proxy";
        else
          return "/songza-api";
      }

      /* Running request is debounced by time
       *  Always min. 500ms after last one */
      var DEBOUNCE_TIME = 1000;

      function debounceRequest() {
        var lastTimestamp = _.last(songzaApiRequestQueryTimestamps);
        if (_.isUndefined(lastTimestamp)) lastTimestamp = 0;
        var waitTime = Math.max(0, -_.now() + (lastTimestamp )) + DEBOUNCE_TIME;
        var currentTimestamp = params.timestamp = _.now() + waitTime;
        console.log("[songzaApi] Request wait time:" + waitTime);
        songzaApiRequestQueryTimestamps.push(currentTimestamp);

        var self = this;
        _.delay(function () {
          self.run()
            .then(function (response) {
              deffered.resolve(response);
            }, function (error) {
              deffered.reject(error);
            });
          songzaApiRequestQueryTimestamps = _.reject(songzaApiRequestQueryTimestamps, function (timestamp) { return timestamp == params.timestamp;})
        }, waitTime);
      }

      _.bind(debounceRequest, this)();

    }

    return {
      song: {
        get: function (songId) {}
      },
      search: {
        artist: function (query, limit) {},
        situation: function (query, style) {style = "flat-220"},
        station: function (query, limit) {
          return new songzaApiRequest("/search/station", {getParams: {'query': query, 'limit': limit}}).promise;
        },
        song: function (query, limit) {},
      },
      station: {
        get: function (stationId) {
          return new songzaApiRequest("/station/:stationId", {'stationId': stationId}).promise;
        },
        next: function (stationId) {
          return new songzaApiRequest("/station/:stationId/next", {'stationId': stationId, proxy: true}).promise;
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
