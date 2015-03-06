 'use strict';

describe('Directive: mbPlayerMainControls', function () {

  // load the directive's module and view
  beforeEach(module('musicBucketApp'));
  beforeEach(module('app/mbPlayerMainControls/mbPlayerMainControls.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<mb-player-main-controls></mb-player-main-controls>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the mbPlayerMainControls directive');
  }));
});
