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
        if (params.proxy && window.location.href.indexOf("localhost") != -1)
          return "http://localhost:9001/songza-api-proxy";
        else
          return "/songza-api";
      }

      /* Running request is debounced by time
       *  Always min. 500ms after last one */
      var DEBOUNCE_TIME = 100;

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
              'style': "flat-220",
            }
          }).promise;
          // situation/targeted?current_date=2015-04-10T14%3A46%3A44-02%3A240&day=5&period=2&device=web&site=songza&optimizer=default&max_situations=5&max_stations=3&style=flat-220
        }
      },
      user: {}
      ,
      helpers: {
        getDayPeriod: songzaHlpGetDayPeriod
  }
}
})
;
