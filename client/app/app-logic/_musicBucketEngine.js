/**
 * Created by orcwarrior on 2014-11-24.
 */

(function () {
  angular.module('musicBucketEngine',
                 ['ngResource', 'musicBucketAuth', 'LocalStorageModule'])
    .config(function ($httpProvider) {
              $httpProvider.interceptors.push('authInterceptor');
            })
    .config(function (localStorageServiceProvider) {
              localStorageServiceProvider
                .setPrefix('music-bucket')
                .setNotify(true, true)
            })
    .factory('authInterceptor', function ($rootScope, $q, $cookieStore) {
              return {
                // Add authorization token to headers
                request: function (config) {
                  config.headers = config.headers || {};
                  if ($cookieStore.get('token')) {
                    config.headers.Authorization = 'Bearer ' + $cookieStore.get('token');
                  }
                  return config;
                }
              };
            })
}
)();
