'use strict';
angular.module('musicBucketApp')
  .service('mbNotifications', function ($mdToast, $rootScope) {
    var parentEl;
    var notifyService = {
      notify: function (template, scope, hideDelay, pos) {
        if (!parentEl) parentEl = (document.getElementsByClassName('mb-body') || [])[0];
        $mdToast.show({
          template: '<md-toast>' +
                    '<div class="md-toast-content">' +
                    template +
                    '</div>' +
                    '</md-toast>',
          autoWrap: !!template,
          scope: scope || $rootScope.$new(true),
          position: pos || 'bottom right',
          parent: parentEl
        })
      }
    };
    return notifyService;
  })
