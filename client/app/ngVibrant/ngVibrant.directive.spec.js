'use strict';

describe('Directive: ngVibrant', function () {

  // load the directive's module
  beforeEach(module('musicBucketApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<ng-vibrant></ng-vibrant>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the ngVibrant directive');
  }));
});