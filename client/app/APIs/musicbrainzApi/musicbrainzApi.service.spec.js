'use strict';

describe('Service: musicbrainzApi', function () {

  // load the service's module
  beforeEach(module('musicBucketApp'));

  // instantiate service
  var musicbrainzApi;
  beforeEach(inject(function (_musicbrainzApi_) {
    musicbrainzApi = _musicbrainzApi_;
  }));

  it('should do something', function () {
    expect(!!musicbrainzApi).toBe(true);
  });

});
