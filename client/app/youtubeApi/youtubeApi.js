'use strict';

angular.module('musicBucketEngine')
  .service('youtubeApi', function ($http, $q) {

    var apiKey = "AIzaSyB4n5CxGsCe3VDLKCFQ8LRYWxGPkb_stuo"
    var youtubeApiRequestQueryTimestamps = [];

    function youtubeApiRequest(urlScheme, params, dontRunRequest) {
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

      this.buildUrl = function () {
        var urlParamRegex = /:(\w+)/g;
        var URL = getBaseUrl() + urlScheme.replace(urlParamRegex, urlParamInjector) + buildUrlGetParams();
        console.log("[youtubeApi] Passed url: " + urlScheme);
        console.log("[youtubeApi] Builded url: " + URL);
        return URL;
      };
      /* Private */

      (function addDefaultGetParams() {
        if (_.isUndefined(params.getParams)) params.getParams = {};
        params.getParams.key = apiKey;
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
        return "https://www.googleapis.com/youtube/v3";
      }

      /* Running request is debounced by time
       *  Always min. 500ms after last one */
      var DEBOUNCE_TIME = 150;

      function debounceRequest() {
        var lastTimestamp = _.last(youtubeApiRequestQueryTimestamps);
        if (_.isUndefined(lastTimestamp)) lastTimestamp = 0;
        var waitTime = Math.max(0, -_.now() + (lastTimestamp )) + DEBOUNCE_TIME;
        var currentTimestamp = params.timestamp = _.now() + waitTime;
        console.log("[youtubeApi] Request wait time:" + waitTime);
        youtubeApiRequestQueryTimestamps.push(currentTimestamp);

        var self = this;
        _.delay(function () {
          self.run()
            .then(function (response) {
              deffered.resolve(response);
            }, function (error) {
              deffered.reject(error);
            });
          youtubeApiRequestQueryTimestamps = _.reject(youtubeApiRequestQueryTimestamps, function (timestamp) { return timestamp == params.timestamp;})
        }, waitTime);
      }

      if (!dontRunRequest)
        _.bind(debounceRequest, this)();

    }

    return {
      // https://api.youtube.com/tracks.json?consumer_key=8d84bbdf76bfc4a57c4996344cebbaf6&q=flume&filter=all&order=hotness
      search: function (query, limit, additionalFilters) {
        var params = additionalFilters || {};
        params = _.extend(params,
          {
            getParams: {
              'q': query,
              videoEmbeddable: true,
              type : 'video',
              order : 'relevance',
              part : 'snippet'
            }
          });
        return new youtubeApiRequest("/search", params).promise;
      },
      video: {
        get: function (videoId) {
          // nope
        }
      },
      playlist: {
        get: function (playlistId) {
          return new youtubeApiRequest('/playlist', {getParams: {part: 'snippet', id: playlistId}}).promise;
        },
        getEntries: function (playlistId, limit, offset) {
          return new youtubeApiRequest('/playlistItems', {
            getParams: {
              part: 'snippet',
              id: playlistId,
              maxResults: limit || 50
            }
          }).promise;
        },
        getAllEntries: function (playlistId) {
          var deferred = $q.defer();
          var allPlaylistItems = [];
          new youtubeApiRequest('/playlistItems', {
            getParams: {part: 'snippet', id: playlistId, limit: 50}
          }).promise
            .then(function (response) {
              var lastResponse = response;
              allPlaylistItems = allPlaylistItems.concat(response.data.items);
              while (lastResponse.data.nextPageToken) {
                new youtubeApiRequest('/playlistItems', {
                  getParams: {
                    part: 'snippet',
                    id: playlistId,
                    limit: 50,
                    pageToken: lastResponse.data.nextPageToken
                  }
                }).promise
                  .then(function (response) {
                    lastResponse = response;
                    allPlaylistItems = allPlaylistItems.concat(response.data.items);
                  });
              }
              deferred.resolve(allPlaylistItems);
            });
          return deferred.promise;
        }
      }
    }
  });
