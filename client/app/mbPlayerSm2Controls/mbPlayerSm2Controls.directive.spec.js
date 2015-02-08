'use strict';

describe('Directive: mbPlayerSm2Controls', function () {

  // load the directive's module and view
  beforeEach(module('musicBucketApp'));
  beforeEach(module('app/mbPlayerSm2Controls/mbPlayerSm2Controls.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<mb-player-sm2-controls></mb-player-sm2-controls>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the mbPlayerSm2Controls directive');
  }));
});