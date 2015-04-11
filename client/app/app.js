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
  'cfp.hotkeys',
  'sticky',
  'ngMaterial'
])
  .config(function ($locationProvider, $httpProvider, $urlRouterProvider, $stateProvider) {
            $urlRouterProvider.otherwise("/");

     $locationProvider.html5Mode(true);
    $httpProvider.interceptors.push('authInterceptor');
  })
  /* Angular material design theme */
  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('deep-purple', {
        'default': '500', // by default use shade 400 from the pink palette for primary intentions
        'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
        'hue-2': '500', // use shade 600 for the <code>md-hue-2</code> class
        'hue-3': 'A100' // use shade A100 for the <code>md-hue-3</code> class
      })
      // If you specify less than all of the keys, it will inherit from the
      // default shades
      .accentPalette('amber', {
        'default': 'A700' // use shade 200 for default, and keep all other shades the same
      })
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
