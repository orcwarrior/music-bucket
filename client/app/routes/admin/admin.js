'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
            $stateProvider
              .state('admin', {
                       url        : '/admin',
                       templateUrl: 'app/routes/admin/admin.html',
                       controller : 'AdminCtrl'
                     });
          });
