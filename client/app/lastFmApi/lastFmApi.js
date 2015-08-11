'use strict';

angular.module('musicBucketEngine')
  .service('lastFmApi', function ($http, $q) {

    var consumerKey = "f5e96dcf7d432fb16d829bf42d27d8c9"
    var lastFmApiRequestQueryTimestamps = [];

    function lastFmApiRequest(params, dontRunRequest) {
      /* Init */
      if (_.isUndefined(params.method)) params.method = "get";
      var deffered = $q.defer();
      this.promise = deffered.promise;
      /* Public */
      this.run = function () {
        var deffered = $q.defer();
        $http[params.method](this.buildUrl(params))
          .then(function (response) {
            deffered.resolve(response);
          }, function (error) {
            deffered.reject(error);
          });
        return deffered.promise;
      };

      this.buildUrl = function () {
        var urlParamRegex = /:(\w+)/g;
        var URL = getBaseUrl() + /*urlScheme.replace(urlParamRegex, urlParamInjector) */ buildUrlGetParams();
        // console.log("[lastFmApi] Passed url: " + urlScheme);
        console.log("[lastFmApi] Builded url: " + URL);
        return URL;
      };
      /* Private */

      (function addDefaultGetParams() {
        if (_.isUndefined(params.getParams)) params.getParams = {};
        params.getParams.api_key = consumerKey;
        params.getParams.format = 'json';
      })();

      function buildUrlGetParams() {
        // Add all get params to URL
        var getParams = "";
        if (!_.isUndefined(params.getParams)) {
          _.each(params.getParams, function (value, key) {
            if (!_.isUndefined(value)) {
              getParams += (getParams == "") ? "?" : "&";
              getParams += key + "=" + encodeURIComponent(value);
            };
          });
        }
        return getParams;
      }

      function urlParamInjector(match, p1, offset, string) {
        return _.isUndefined(params[p1]) ? "" : params[p1];
      }

      function getBaseUrl() {
        return "http://ws.audioscrobbler.com/2.0/";
      }

      /* Running request is debounced by time
       *  Always min. 500ms after last one */
      var DEBOUNCE_TIME = 250;

      function debounceRequest() {
        var lastTimestamp = _.last(lastFmApiRequestQueryTimestamps);
        if (_.isUndefined(lastTimestamp)) lastTimestamp = 0;
        var waitTime = Math.max(0, -_.now() + (lastTimestamp )) + DEBOUNCE_TIME;
        var currentTimestamp = params.timestamp = _.now() + waitTime;
        console.log("[lastFmApi] Request wait time:" + waitTime);
        lastFmApiRequestQueryTimestamps.push(currentTimestamp);

        var self = this;
        _.delay(function () {
          self.run()
            .then(function (response) {
              deffered.resolve(response);
            }, function (error) {
              deffered.reject(error);
            });
          lastFmApiRequestQueryTimestamps = _.reject(lastFmApiRequestQueryTimestamps, function (timestamp) {
            return timestamp == params.timestamp;
          })
        }, waitTime);
      }

      if (!dontRunRequest)
        _.bind(debounceRequest, this)();

    }

    return {
      // https://api.soundcloud.com/tracks.json?consumer_key=8d84bbdf76bfc4a57c4996344cebbaf6&q=flume&filter=all&order=hotness
      search: {
        track: function (query, limit, additionalFilters) {
          var params = additionalFilters || {};
          params = _.extend(params, {getParams: {'q': query, 'limit': limit || 100, 'streamable': true}});
          return new lastFmApiRequest("/tracks.json", params).promise;
        },
      },
      artist: {
        getInfo: function (artist, mbid, lang, autocorrect) {
          var params = {
            getParams: {
              'method': 'artist.getinfo',
              'artist': artist,
              'mbid' : mbid,
              'lang': lang,
              'autocorrect': autocorrect
            }
          };
          return new lastFmApiRequest(params).promise;
        },
        getTopTracks : function (artist, lang, autocorrect, page, limit) {
          var params = {
            getParams: {
              'method': 'artist.getTopTracks',
              'artist': artist,
              'lang': lang,
              'page' : page,
              'limit' : limit,
              'autocorrect': autocorrect
            }
          };
          return new lastFmApiRequest(params).promise;
        },
        getTopAlbums : function (artist, lang, autocorrect, page, limit) {
          var params = {
            getParams: {
              'method': 'artist.getTopAlbums',
              'artist': artist,
              'lang': lang,
              'page' : page,
              'limit' : limit,
              'autocorrect': autocorrect
            }
          };
          return new lastFmApiRequest(params).promise;
        },
        getSimilar: function () {

        }

      }
    }
  });
