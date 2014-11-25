'use strict';

angular.module('musicBucketApp')
  .config(function ($stateProvider) {
            $stateProvider
              .state('main.songza.station', {
                      url        : '/songza/station/:id',
                      templateUrl: 'app/songza/station/station.html',
                      controller : 'SongzaStationCtrl'
                    });
          });
