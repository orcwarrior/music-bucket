'use strict';

describe('Directive: mbPlayerToolbarWrapperTop', function () {

  // load the directive's module and view
  beforeEach(module('musicBucketApp'));
  beforeEach(module('app/mbPlayerToolbarWrapperTop/mbPlayerToolbarWrapperTop.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<mb-player-toolbar-wrapper-top></mb-player-toolbar-wrapper-top>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the mbPlayerToolbarWrapperTop directive');
  }));
});