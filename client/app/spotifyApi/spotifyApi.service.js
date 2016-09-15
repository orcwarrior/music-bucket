'use strict';

angular.module('musicBucketEngine')
  .service('spotifyApi', function ($http, $q, $window, $rootScope, $interval, localStorageService, searchApisRegistry, searchDefinition) {

    var spotifyApiRequestQueryTimestamps = [];
    var BASE_URL = "https://api.spotify.com/v1";
    var SPOTIFY_CLIENDID = "68166e0a3ed34236b1d99f51a1c52d16";
    var defaultScopes = ['playlist-read-private',
      'playlist-read-collaborative',
      'user-library-read',
      'user-read-email',
      'user-top-read'];

    function spotifyApiGetAuthToken(scopes) {
      var deffered = $q.defer();
      var code = localStorageService.get('spotifyAuthTokenCode');
      var token = localStorageService.get('spotifyAuthToken');

      if (!code) {
        console.log("[spotifyApi] Get auth code first...");
        spotifyApiModalAuthorization(scopes)
          .then(function (authObj) {
            spotifyApiGetAuthToken(scopes) // call recurently to actually fetch the token
              .then(function (authToken) {
                deffered.resolve(authToken);
              });

          });
      } else if (!token) {
        console.log("[spotifyApi] Create auth token... " + _getLocalStorageSpotifyAuthObj().code);
        spotifyApi.accounts.authToken(code)
          .then(function (response) {
            if (response.data.error === "invalid_grant") {
              // clears code to get another new one:
              localStorageService.remove('spotifyAuthTokenCode');
              spotifyApiGetAuthToken(scopes) // clear code field and restart whole auth operation
                .then(function (authToken) {
                  deffered.resolve(authToken);
                });
            } else {
              _createLocalStorageFromSpotifyAuthObj(response.data);
              deffered.resolve(response.data.access_token);
            }
          });

      } else if (!_isAuthTokenCurrent()) {
        // refresh expired token
        console.log("[spotifyApi] Refresh auth token... " + _getLocalStorageSpotifyAuthObj().refresh_token);
        spotifyApi.accounts.refreshToken(_getLocalStorageSpotifyAuthObj().refresh_token)
          .then(function (response) {
            _createLocalStorageFromSpotifyAuthObj(response.data);
            deffered.resolve(response.data.access_token);
          });
      } else {
        console.log("[spotifyApi] Token ready to use");
        deffered.resolve(_getLocalStorageSpotifyAuthObj().access_token);
      }

      return deffered.promise;
    }

    function spotifyApiModalAuthorization(scopes) {
      var deffered = $q.defer();
      var loginWindow = $window.open(spotifyApi.accounts.getAuthCodeUrl(scopes),
        'Spotify Connect', 'location=no, height=auto, width=420px');
      var loginModalCloseDirtyCheck = $interval(function () {
        if (!loginWindow.closed) return;
        if (!_getLocalStorageSpotifyAuthObj().code) deffered.reject({reason: 'user don\'t want to authorize!'});

        $interval.cancel(loginModalCloseDirtyCheck);
        deffered.resolve(_getLocalStorageSpotifyAuthObj());
      }, 500);

      return deffered.promise;
    }

    function _isAuthTokenCurrent() {
      var tokenExpiration = moment(localStorageService.get('spotifyAuthTokenExpires'));
      var now = moment();
      return now.isBefore(tokenExpiration);
    }

    function _createLocalStorageFromSpotifyAuthObj(authObj) {
      if (authObj.expires_in) {
        var tokenExpireTime = moment().add(parseInt(authObj.expires_in), 's').toISOString();
        localStorageService.set('spotifyAuthTokenExpires', tokenExpireTime);
      }
      if (authObj.access_token)
        localStorageService.set('spotifyAuthToken', authObj.access_token);
      if (authObj.token_type)
        localStorageService.set('spotifyAuthTokenType', authObj.token_type);
      if (authObj.refresh_token)
        localStorageService.set('spotifyAuthTokenRefresh', authObj.refresh_token);
      $rootScope.$broadcast('spotifyApi:authorized', authObj);
    }

    function _getLocalStorageSpotifyAuthObj() {
      return {
        access_token: localStorageService.get('spotifyAuthToken'),
        code: localStorageService.get('spotifyAuthTokenCode'),
        expire_time: localStorageService.get('spotifyAuthTokenExpires'),
        token_type: localStorageService.get('spotifyAuthTokenType'),
        refresh_token: localStorageService.get('spotifyAuthTokenRefresh')
      }
    }

    function spotifyApiRequest(urlScheme, params, buildUrlOnly) {
      /* Init */
      if (_.isUndefined(params.method)) params.method = "get";
      var spotifyRequest = this;
      var deffered = $q.defer();
      this.promise = deffered.promise;
      /* Public */
      this.run = function () {
        var _deffered = $q.defer();
        if (params.authorization)
          new spotifyApiGetAuthToken()
            .then(function (authToken) {
              $http({
                url: buildUrl(urlScheme, params),
                method: params.method,
                data: params.data,
                headers: {'Authorization': "Bearer " + authToken}
              })
                .then(function (response) {
                  _deffered.resolve(response);
                }, function (error) {
                  _deffered.reject(error);
                });

            });
        else /* no authorization */
          $http({
            url: buildUrl(urlScheme, params),
            method: params.method,
            data: params.data
          })
            .then(function (response) {
              _deffered.resolve(response);
            }, function (error) {
              _deffered.reject(error);
            });
        return _deffered.promise;
      };

      /* Private */
      function buildUrl(urlScheme) {
        var urlParamRegex = /:([A-z]+)/g;
        var URL = urlScheme.replace(urlParamRegex, urlParamInjector) + buildUrlGetParams();
        if (urlScheme.lastIndexOf("http", 0) !== 0 && urlScheme.lastIndexOf("//", 0) !== 0)
          URL = BASE_URL + URL;

        console.log("[spotifyApi] Passed url: " + urlScheme);
        console.log("[spotifyApi] Builded url: " + URL);
        spotifyRequest.url = URL;
        return URL;
      }

      function buildUrlGetParams() {
        // Add all get params to URL
        var getParams = "";
        if (!_.isUndefined(params.getParams)) {
          _.each(params.getParams, function (value, key) {
            if (!_.isUndefined(value)) {
              getParams += (getParams == "") ? "?" : "&";
              if (_.isArray(value)) {
                getParams += _.reduce(value, function (chain, val) {
                  return chain + key + "=" + val + "&";
                }, "");
                getParams.slice(0, -1); // remove last '&'
              }
              else
                getParams += key + "=" + value;
            }
          });
        }
        return getParams;
      }

      function urlParamInjector(match, p1, offset, string) {
        return _.isUndefined(params[p1]) ? "" : params[p1];
      }

      /* Running request is debounced by time
       *  Always min. 500ms after last one */
      var DEBOUNCE_TIME = 200;

      function debounceRequest() {
        var lastTimestamp = _.last(spotifyApiRequestQueryTimestamps);
        if (_.isUndefined(lastTimestamp)) lastTimestamp = -DEBOUNCE_TIME;
        var waitTime = Math.max(0, -_.now() + (lastTimestamp )) + DEBOUNCE_TIME;
        var currentTimestamp = params.timestamp = _.now() + waitTime;
        console.log("[spotifyApi] Request wait time:" + waitTime);
        spotifyApiRequestQueryTimestamps.push(currentTimestamp);

        var self = this;
        _.delay(function () {
          self.run()
            .then(function (response) {
              deffered.resolve(response);
            }, function (error) {
              deffered.reject(error);
            });
          spotifyApiRequestQueryTimestamps = _.reject(spotifyApiRequestQueryTimestamps, function (timestamp) {
            return timestamp == params.timestamp;
          })
        }, waitTime);
      }

      if (buildUrlOnly)
        buildUrl(urlScheme);
      else
        _.bind(debounceRequest, this)();

    }

    function _getOrigin() {
      return (window.location.protocol + "//" + window.location.host);
    }

    var spotifyApi = {
      _v: {
        objType: {
          album: "album",
          artist: "artist",
          track: "track",
          tracks: "playlist"
        }
      },
      accounts: {
        getAuthCodeUrl: function (scopes) {
          return new spotifyApiRequest("https://accounts.spotify.com/authorize", {
            getParams: {
              client_id: SPOTIFY_CLIENDID,
              response_type: "code",
              scope: _.extend(defaultScopes, scopes).join(' '),
              redirect_uri: encodeURIComponent(_getOrigin() + "/spotify/logincb")
            }
          }, true).url;
        },
        authorize: function (scopes) {
          return spotifyApiGetAuthToken(scopes);
        },
        authToken: function (code) {
          return new spotifyApiRequest(_getOrigin() + "/spotify-token", {
            getParams: {
              grant_type: "authorization_code",
              code: code,
              redirect_uri: encodeURIComponent(_getOrigin() + "/spotify/logincb")
            }
          }).promise;
        },
        refreshToken: function (refreshToken) {
          return new spotifyApiRequest(_getOrigin() + "/spotify-token", {
            getParams: {
              grant_type: "refresh_token",
              refresh_token: refreshToken,
              redirect_uri: encodeURIComponent(_getOrigin() + "/spotify/logincb")
            }
          }).promise;
        },
        clearToken: function () {
          localStorageService.remove('spotifyAuthToken');
          localStorageService.remove('spotifyAuthTokenCode');
          localStorageService.remove('spotifyAuthTokenExpires');
          localStorageService.remove('spotifyAuthTokenType');
          localStorageService.remove('spotifyAuthTokenRefresh');
          $rootScope.$broadcast('spotifyApi:authorized', undefined);
        }, isAuthorized: function () {
          var token = localStorageService.get('spotifyAuthToken');
          return token && _isAuthTokenCurrent();
        }
      },
      albums: {
        get: function (albumId) {
          return new spotifyApiRequest("/albums/:albumId", {
              authorization: true,
              albumId: albumId
            }
          ).promise;
        }
      },
      browse: {
        categories: {
          list: function (limit, offset) {
            var locale = $window.navigator.language || $window.navigator.userLanguage;
            if (locale.length === 2) locale += "_" + locale.toUpperCase();

            return new spotifyApiRequest("/browse/categories", {
                authorization: true,
                getParams: {
                  'locale': locale,
                  'country': locale.substring(3),
                  'limit': limit || 20,
                  'offset': offset || 0
                }
              }
            ).promise;
          },
          get: function (categoryId, limit, offset) {
            var locale = $window.navigator.language || $window.navigator.userLanguage;
            if (locale.length === 2) locale += "_" + locale.toUpperCase();

            return new spotifyApiRequest("/browse/categories/:categoryId", {
                authorization: true,
                categoryId: categoryId,
                getParams: {
                  'locale': locale,
                  'country': locale.substring(3)
                }
              }
            ).promise;
          },
          getPlaylists: function (categoryId, limit, offset) {
            var locale = $window.navigator.language || $window.navigator.userLanguage;
            if (locale.length === 2) locale += "_" + locale.toUpperCase();

            return new spotifyApiRequest("/browse/categories/:categoryId/playlists", {
                authorization: true,
                categoryId: categoryId,
                getParams: {
                  'locale': locale,
                  'country': locale.substring(3)
                }
              }
            ).promise;
          }
        },
        newReleases: function (limit, offset) {
          var locale = $window.navigator.language || $window.navigator.userLanguage;
          if (locale.length === 2) locale += "_" + locale.toUpperCase();

          return new spotifyApiRequest("/browse/new-releases", {
              authorization: true,
              getParams: {
                'country': locale.substring(3)
              }
            }
          ).promise;
        },
        featuredPlaylists: function (limit, offset) {
          var locale = $window.navigator.language || $window.navigator.userLanguage;
          if (locale.length === 2) locale += "_" + locale.toUpperCase();

          return new spotifyApiRequest("/browse/featured-playlists", {
              authorization: true,
              getParams: {
                'timestamp': moment().toISOString(),
                'country': locale.substring(3),
                'limit': limit || 20,
                'offset': offset || 0
              }
            }
          ).promise;
        }
      },
      playlists: {
        search: function (query, limit, offset) {
          return spotifyApi.search(query, 'playlist', limit, offset)
        }
      },
      search: function (query, type, limit, offset) {
        return new spotifyApiRequest("/search", {
          getParams: {
            'q': query,
            'type': type || "playlist",
            'limit': limit || 20,
            'offset': offset || 0
          }
        }).promise;
      },
      me: function () {
        return new spotifyApiRequest("/me", {
          authorization: true
        }).promise;

      }
      ,
      users: {
        playlists: {
          all: function (userId, limit, offset) {
            return new spotifyApiRequest("/users/:userId/playlists", {
              authorization: true,
              userId: userId,
              getParams: {
                limit: limit || 20,
                offset: offset || 0
              }
            }).promise;

          },
          get: function (playlistId, userId) {
            return new spotifyApiRequest("/users/:userId/playlists/:playlistId", {
                authorization: true,
                playlistId: playlistId,
                userId: userId
              }
            ).promise;
          }
        }
      }
    }

    // Register searchApi's:
    searchApisRegistry.registerSearchService(
      'spSP', spotifyApi.playlists.search, {
        searchTypeMatching: 'playlist', searchSrcKey: 'query',
        searchName: "Spotify Playlists", searchCollectionPath: 'data.playlists.items',
        searchMaxItemsPath: 'data.playlists.total'
      });
    var arr = searchApisRegistry.search(new searchDefinition('playlist', {query: 'test'}));
    return spotifyApi;
  });
