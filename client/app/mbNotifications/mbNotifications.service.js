"use strict";
angular.module("musicBucketApp")
  .service("mbNotifications", function ($mdToast, $rootScope) {
    var parentEl;
    const DEFAULT_HIDE_DELAY = 3000;
    var notificationsQuery = [];
    var currentNotification;

    function _createNotificationObj(template, scope, hideDelay, pos) {
      return {template: template, scope: scope, hideDelay: hideDelay || DEFAULT_HIDE_DELAY, pos: pos};
    }

    function _showNotification(notificationObj) {
      if (!parentEl) parentEl = (document.getElementsByClassName('mb-body') || [])[0];
      console.log("Notifications: show notif: " + notificationObj.template);
      $mdToast.show({
        template: "<md-toast><div class=\"md-toast-content\">" +
        notificationObj.template +
        "</div></md-toast>",
        autoWrap: !!notificationObj.template,
        scope: notificationObj.scope || $rootScope.$new(true),
        position: notificationObj.pos || 'bottom right',
        parent: parentEl,
        hideDelay: notificationObj.hideDelay
      });
      setTimeout(function () {
        console.log("Notifications: delete notif: %s (%s)", currentNotification.template, currentNotification.hideDelay);
        currentNotification = undefined;
        if (notificationsQuery.length)
          notifyService.notifyByObj(__shortageDurationTime(notificationsQuery.shift()));
      }, notificationObj.hideDelay);
    }

    function __shortageDurationTime(notificationObj) {
      if (notificationObj)
        notificationObj.hideDelay = notificationObj.hideDelay / Math.sqrt(notificationsQuery.length+1);
      return notificationObj;
    }


    var notifyService = {
      notifyByObj: function (notifyObj) {
        if (currentNotification) {
          console.log("Notifications: query notif: " + notifyObj.template);
          notificationsQuery.push(notifyObj);
        }
        else {
          currentNotification = notifyObj;
          _showNotification(currentNotification);
        }
      },
      notify: function (template, scope, hideDelay, pos) {
        return this.notifyByObj(_createNotificationObj(template, scope, hideDelay, pos));
      }
    };
    return notifyService;
  });
