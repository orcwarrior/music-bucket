'use strict';

describe('Directive: mbPlayer', function () {

  // load the directive's module and view
  beforeEach(module('musicBucketApp'));
  beforeEach(module('app/mbPlayer/mbPlayer.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<mb-player></mb-player>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the mbPlayer directive');
  }));
});