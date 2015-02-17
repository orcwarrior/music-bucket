'use strict';

describe('Service: mbYoutubePlayer', function () {

  // load the service's module
  beforeEach(module('musicBucketApp'));

  // instantiate service
  var mbYoutubePlayer;
  beforeEach(inject(function (_mbYoutubePlayer_) {
    mbYoutubePlayer = _mbYoutubePlayer_;
  }));

  it('should do something', function () {
    expect(!!mbYoutubePlayer).toBe(true);
  });

});
