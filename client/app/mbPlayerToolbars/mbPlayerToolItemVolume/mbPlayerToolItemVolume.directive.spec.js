'use strict';

describe('Directive: mbPlayerToolItemPlayOrder', function () {

  // load the directive's module and view
  beforeEach(module('musicBucketApp'));
  beforeEach(module('app/mbPlayerToolItemPlayOrder/mbPlayerToolItemPlayOrder.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<mb-player-tool-item-play-order></mb-player-tool-item-play-order>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the mbPlayerToolItemPlayOrder directive');
  }));
});