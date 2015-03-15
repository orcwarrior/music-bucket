'use strict';

describe('Directive: mbPlayerToolItemSavePlaylist', function () {

  // load the directive's module and view
  beforeEach(module('musicBucketApp'));
  beforeEach(module('app/mbPlayerToolbars/mbPlayerToolItemSavePlaylist/mbPlayerToolItemSavePlaylist.html'));

  var element, scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<mb-player-tool-item-save-playlist></mb-player-tool-item-save-playlist>');
    element = $compile(element)(scope);
    scope.$apply();
    expect(element.text()).toBe('this is the mbPlayerToolItemSavePlaylist directive');
  }));
});