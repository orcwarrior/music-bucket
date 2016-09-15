'use strict';

describe('Directive: mediaCollection', function () {

  // load the directive's module and view
  beforeEach(module('musicBucketApp'));
  beforeEach(module('app/mediaCollection/mediaCollection.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<media-collection></media-collection>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the mediaCollection directive');
  }));
});