'use strict';

angular.module('musicBucketApp', [
  'ngCookies',
  'ngResource',
  'ngSanitize',
  'btford.socket-io',
  'ui.bootstrap',
  'angularSoundManager',
  'musicBucketEngine',
  'musicBucketAuth',
  'ui.router',
  'cfp.hotkeys'
])
  .config(function ($locationProvider, $httpProvider, $urlRouterProvider, $stateProvider) {
            $urlRouterProvider.otherwise("/");

     $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
  })

  .factory('authInterceptor', function ($rootScope, $q, $cookieStore, $location) {
    return {
      // Add authorization token to headers
      request: function (config) {
        config.headers = config.headers || {};
        /* DK: Hacky way to not adding authorization to proxy requests*/
        if ($cookieStore.get('token') && config.url.indexOf("/api/") !== -1) {
          config.headers.authorization = 'Bearer ' + $cookieStore.get('token');
        }
        return config;
      },

      // Intercept 401s and redirect you to login
      responseError: function(response) {
        if(response.status === 401) {
          $location.path('/login');
          // remove any stale tokens
          $cookieStore.remove('token');
          return $q.reject(response);
        }
        else {
          return $q.reject(response);
        }
      }
    };
  })

  .run(function ($rootScope, $location, $http, Auth, mbPlayerEngine) {
    // Init Bootstrap material design:
    $.material.init();

    // Redirect to login if route requires auth and you're not logged in
    $rootScope.$on('$routeChangeStart', function (event, next) {
      Auth.isLoggedInAsync(function(loggedIn) {
        if (next.authenticate && !loggedIn) {
          $location.path('/login');
        }
      });

    });
    $http.defaults.useXDomain = true;
         // TMP: initialize songza api:
         // $rootScope.songza = new songzaInit({userAgent: 'Some browser'});
    mbPlayerEngine.init();
  });
