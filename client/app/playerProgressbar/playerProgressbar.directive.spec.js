'use strict';

describe('Directive: playerProgressbar', function () {

  // load the directive's module and view
  beforeEach(module('musicBucketApp'));
  beforeEach(module('app/playerProgressbar/playerProgressbar.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<player-progressbar></player-progressbar>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the playerProgressbar directive');
  }));
});