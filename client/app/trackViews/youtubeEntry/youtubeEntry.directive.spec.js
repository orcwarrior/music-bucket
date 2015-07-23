'use strict';

describe('Directive: songzaStation', function () {

  // load the directive's module and view
  beforeEach(module('musicBucketApp'));
  beforeEach(module('app/trackViews/songzaStation/songzaStation.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<songza-station></songza-station>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the songzaStation directive');
  }));
});