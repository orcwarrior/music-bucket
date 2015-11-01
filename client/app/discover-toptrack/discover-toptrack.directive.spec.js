'use strict';

describe('Directive: discoverToptrack', function () {

  // load the directive's module and view
  beforeEach(module('musicBucketApp'));
  beforeEach(module('app/discover-toptrack/discover-toptrack.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<discover-toptrack></discover-toptrack>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the discoverToptrack directive');
  }));
});