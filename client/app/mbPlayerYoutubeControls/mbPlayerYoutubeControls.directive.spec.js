'use strict';

describe('Directive: mbPlayerYoutubeControls', function () {

  // load the directive's module and view
  beforeEach(module('musicBucketApp'));
  beforeEach(module('app/mbPlayerYoutubeControls/mbPlayerYoutubeControls.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<mb-player-youtube-controls></mb-player-youtube-controls>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the mbPlayerYoutubeControls directive');
  }));
});