'use strict';

angular.module('musicBucketEngine')
  .service('musicbrainzApi', function ($http, $q) {

    var REQ_TYPE_SEARCH = "search";
    var REQ_TYPE_SINGLE = "single";
    var mbApiRequestQueryTimestamps = [];

    function musicbrainzApiRequestSingle(entity, id, params) {
      params.requestType = REQ_TYPE_SINGLE;
      params.entityId = id;
      return new musicbrainzApiRequestVirtual(entity, params);
    }

    function musicbrainzApiRequestSearch(entity, params) {
      params.requestType = REQ_TYPE_SEARCH;
      return new musicbrainzApiRequestVirtual(entity, params);
    }

    function musicbrainzApiRequestVirtual(entity, params) {
      /* Config */
      var QUERY_DURATION_DELTA_MS = 10000; // +/-10s
      /* Init */
      var self = this;
      var deffered = $q.defer();
      this.promise = deffered.promise;
      params = processParams();

      function buildUrl() {
        return "https://musicbrainz.org/ws/2/" + entity + (function () {
            if (params.requestType === REQ_TYPE_SEARCH) return buildQuery();
            if (params.requestType === REQ_TYPE_SINGLE) return params.entityId + "/";
            /* here add additional kinds of request url schema */
          })() + buildGetParams();

      }

      function processParams() {
        return _.mapObject(params, function (value, key) {
          switch (key) {
            case "dur":
              return "[" + (value - QUERY_DURATION_DELTA_MS) + " TO " + (value + QUERY_DURATION_DELTA_MS) + "]";
              break;
            case "artist":
            case "recording":
            case "query":
              return encodeURIComponent(unescapeQueryValue(value).replace(new RegExp(' ', 'g'), "+"));
              break;
            default:
              return value;
              break;
          }
        });
      }

      function buildQuery() {
        var query = "";
        var queryParams = _.omit(params, "requestType", "getParams", "timestamp", "entityId");
        _.map(queryParams, function (val, key) {
          if (query != "") query += " AND ";
          if (key === "query") // special case:
            query += val;
          else
            query += key + ":" + val;
        });
        if (query !== "") query += "/?query=";
        return query;
      }

      function buildGetParams() {
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

      function unescapeQueryValue(value) {
        var specials = [
          // "-"
          , "["
          , "]"
          // order doesn't matter for any of these
          , "/"   // 1
          , "{"   // 1
          , "}"   // 1
          , "("   // 1
          , ")"   // 1
          , "*"   // 1
          , "+"   // 1
          , "?"   // 1
          , "."   // 1
          , "\\"  // 1
          , "^"   // 1
          // , "-"   // 1
          , "&"   // 1
          , "\""   // 1
        ];
        var nonEscaped = "~:";
        var otherGroups = ["\\|\\|", "&&"];
        var regexpr = "(" + ['[' + specials.join('\\') + nonEscaped + ']'].concat(otherGroups).join("|") + ")";
        var regex = new RegExp(regexpr, 'g');
        return value.replace(regex, "\\$1");
      }

      this.run = function () {
        var deffered = $q.defer();
        var url = buildUrl();
        $http.get(url)
          .then(function (response) {
            deffered.resolve(response);
          });
        return deffered.promise;
      };

      /* Running request is debounced by time
       *  Always min. 500ms after last one */
      var DEBOUNCE_TIME = 1000;

      function debounceRequest() {
        var lastTimestamp = _.last(mbApiRequestQueryTimestamps);
        if (_.isUndefined(lastTimestamp)) lastTimestamp = 0;
        var waitTime = Math.max(0, -_.now() + (lastTimestamp )) + DEBOUNCE_TIME;
        var currentTimestamp = params.timestamp = _.now() + waitTime;
        console.log("[mbApi] Request wait time:" + waitTime);
        mbApiRequestQueryTimestamps.push(currentTimestamp);

        var self = this;
        _.delay(function () {
          self.run()
            .then(function (response) {
              deffered.resolve(response);
            });
          mbApiRequestQueryTimestamps = _.reject(mbApiRequestQueryTimestamps, function (timestamp) {
            return timestamp == params.timestamp;
          })
        }, waitTime);
      }

      _.bind(debounceRequest, this)();
    }

    function setDefaultOptions(options) {
      if (_.isUndefined(options.getParams)) options.getParams = {};
      if (_.isUndefined(options.getParams.fmt)) options.getParams.fmt = "json";
    }

    return {
      coverArt: {
        get: function (releaseId) {
          return $http.get("/coverartarchive-api/" + releaseId);
        }
      },
      search: {
        recording: function (queryOpt, limit) {
          setDefaultOptions(queryOpt);
          return new musicbrainzApiRequestSearch("recording", queryOpt, limit).promise;
        },
        release: function (query, limit, offset, incEntities) {
          setDefaultOptions(query);
          query.getParams = _.extend(query.getParams,
            {'inc': (_.isUndefined(incEntities)) ? undefined : incEntities.join('+'),
             'limit': limit,
             'offset': offset}
          );
          return new musicbrainzApiRequestSearch("release", query, limit).promise;
        }
      },
      get: {
        release: function (rId, incEntities) {
          setDefaultOptions({});
          return new musicbrainzApiRequestSingle("release", rId, {
            getParams: {'inc': (_.isUndefined(incEntities)) ? undefined : incEntities.join('+')}},
            {}).promise;
        }
      },
      helper: {
        concatArtists: function (artistCredits) {
          var fullArtist = "";
          for (var i = 0, length = artistCredits.length; i < length; i++) {
            var credit = artistCredits[i];
            fullArtist += credit.artist.name + (_.isUndefined(credit.joinphrase) ? "" : credit.joinphrase);
          }
          return fullArtist;
        },
        getReleaseType: function (release) {
          if (release['release-group']['primary-type'] === "Single") return "SINGLE";
          if (release['release-group']['primary-type'] === "EP") return "EP";
          if (release['release-group']['primary-type'] === "Album")
            if (release['release-group']['secondary-types']) {
              if (release['release-group']['secondary-types'][0] === "Compilation") return "COMPILATION";
              if (release['release-group']['secondary-types'][0] === "Remix")       return "REMIX";
            }
            else return "ALBUM";
        },
        flattenRecording: function (recording) {
          // NOT IMPLEMENTED
          var mbRecording = {};
          mbRecording.id = recording.id;
          mbRecording.duration = recording.length;

          mbRecording.tags = [];
          for (var tag in recording.tags)
            mbRecording.tags.push(tag.name);
        }
      }

    }
  });
