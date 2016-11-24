'use strict';
angular.module('musicBucketApp')
  .service('mbNotifications', function ($mdToast) {
    var notifyService = {
      notify: function (template, scope, hideDelay, pos) {
        $mdToast.show({ template: template,
        autoWrap: !!template,
        scope: scope,
        position: pos || 'bottom right'
        })
      }
    }
    return notifyService;
  })
