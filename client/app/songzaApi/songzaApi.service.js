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
      };

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
        if (params.proxy && (window.location.href.indexOf("localhost") != -1
          || window.location.href.indexOf("192.168.0.") != -1))
          return "http://" + window.location.host + "/songza-api-proxy/api/1";
        else
          return "/songza-api/api/1";
      }

      /* Running request is debounced by time
       *  Always min. 500ms after last one */
      var DEBOUNCE_TIME = 751;

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
          songzaApiRequestQueryTimestamps = _.reject(songzaApiRequestQueryTimestamps, function (timestamp) {
            return timestamp == params.timestamp;
          })
        }, waitTime);
      }

      _.bind(debounceRequest, this)();

    }

    var songzaHlpGetDayPeriod = function (date) {
      var time_periods = [
        {'value': 0, 'label': 'Morning', 'hours_range': [4, 8]},
        {'value': 1, 'label': 'Late Morning', 'hours_range': [9, 11]},
        {'value': 2, 'label': 'Afternoon', 'hours_range': [12, 16]},
        {'value': 3, 'label': 'Evening', 'hours_range': [17, 20]},
        {'value': 4, 'label': 'Night', 'hours_range': [21, 23]},
        {'value': 5, 'label': 'Late Night', 'hours_range': [0, 3]}
      ];

      var hour = moment(date).hour();
      var selPeriod = null;
      _.each(time_periods, function (period) {
        if (period.hours_range[0] <= hour && hour <= period.hours_range[1])
          selPeriod = period;
      });
      return selPeriod;
    };

    return {
      song: {
        get: function (songId) {
        }
      },
      search: {
        artist: function (query, limit) {
        },
        situation: function (query, style) {
          style = "flat-220"
          return new songzaApiRequest("/search/situation", {getParams: {'style': style, 'query': query, 'limit': limit}}).promise;

        },
        station: function (query, limit) {
          return new songzaApiRequest("/search/station", {getParams: {'query': query, 'limit': limit}}).promise;
        },
        song: function (query, limit) {
        },
      },
      station: {
        get: function (stationId) {
          return new songzaApiRequest("/station/:stationId", {'stationId': stationId}).promise;
        },
        next: function (stationId) {
          return new songzaApiRequest("/station/:stationId/next", {'stationId': stationId, proxy: true}).promise;
        },
        multi: function (stationIds) {
          // Multi request?
          var CHUNK_SIZE = 150;
          var mainDeferred = $q.defer();
          var promises = [];
          var stationChunks = _.groupBy(stationIds, function (el, index) {
            return Math.floor(index / CHUNK_SIZE);
          });

          console.log("Multi station request, count: " + stationIds.length + ", chunks: " + stationChunks.length);

          // Setup requests
          var requestCnt = _.size(stationChunks);
          _.each(stationChunks, function (chunk) {
            var stationsChain;
            if (window.location.href.indexOf("localhost") != -1)
              stationsChain = chunk.join();
            else {
              stationsChain = chunk.join("&id=");
              stationsChain += "&app=mb";
            }
            promises.push(new songzaApiRequest("/station/multi", {
              getParams: {id: stationsChain},
              proxy: true
            }).promise);

          });

          // Handle promises
          var allStations = [];
          _.each(promises, function (promise) {
            promise.then(function (response) {
              requestCnt--;
              allStations = _.union(allStations, response.data);
              // BUGFIX: Strange behaviour - multi duplicates stations somehow, let them be unique.
              allStations = _.uniq(allStations, false, function (station) {
                return station.id;
              });
              if (!requestCnt)
                mainDeferred.$$resolve({data: allStations});
            });
          });

          return mainDeferred.promise;
        },
        downvote: undefined,
        upvote: undefined,
        create: undefined,
        update: undefined,
        addSong: undefined,
        stationSong: undefined,
        release: undefined,
        // http://songza.com/api/1/station/1708916/song/5419075/notify-play
        notifyPlay  :function(stationId, songId, skip) {
          return new songzaApiRequest("/station/:stationId/song/:songId/notify-play",
            {'stationId': stationId, 'songId': songId, proxy: false,
            getParams: { 'skip' : (skip ? 1 : undefined)}}).promise;
        }
      },
      artist: function (artistId) {

      },
      situation: {
        targeted: function (maxSituations, maxStations) {
          var curDate = new Date();
          return new songzaApiRequest("/situation/targeted", {
            getParams: {
              'current_date': encodeURIComponent(moment().format()), // ISO 8601
              'day': moment().day(),
              'period': songzaHlpGetDayPeriod(curDate).value,
              'device': 'web',
              'site': 'songza',
              'optimizer': 'default',
              'max_situations': maxSituations || 5,
              'max_stations': maxStations || 5,
              'style': "flat-220"
            }
          }).promise;
          // situation/targeted?current_date=2015-04-10T14%3A46%3A44-02%3A240&day=5&period=2&device=web&site=songza&optimizer=default&max_situations=5&max_stations=3&style=flat-220
        }
      },
      activities: function () {
        return new songzaApiRequest("/gallery/tag/activities", {}).promise;
      },
      decades: function () {
        return new songzaApiRequest("/gallery/tag/decades", {}).promise;
      },
      genres: function () {
        return new songzaApiRequest("/gallery/tag/genres", {}).promise;
      },
      moods: function () {
        return new songzaApiRequest("/gallery/tag/moods", {}).promise;
      },
      user: {}
      ,
      helpers: {
        getDayPeriod: songzaHlpGetDayPeriod,
        createStationLoader: function (stationId) {
          return {id: stationId, isLoading: true};
        }
      }
    }
  }
)
;
