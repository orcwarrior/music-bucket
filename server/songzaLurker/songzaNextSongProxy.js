/**
 * Created by orcwa on 27.12.2015.
 */


var songzaConstructor = require('songza');
var songza = new songzaConstructor({userAgent: 'mb-backend/v0'});
var rp = require('request-promise');

module.exports = exports = function songzaNextSongProxy(stationId) {

  // temporary disabled
 /*
  if (process.env.HEROKU_PRODUCTION == "true") {
    return songza.station.nextSong(stationId);
  }
  else {
  */
    return proxySongza("/songza-api-proxy/api/1/station/" + stationId + "/next");
  //}
};

function proxySongza(url) {
  var pattern = /\/songza-api-proxy\/(.*)/;
  if (pattern.exec(url)) {
    var queryString = '__dest_url=/' + url.match(pattern)[1].replace('?', '&') + "&client=mb";

    try {
      return rp({
        headers: {
          'Access-Control-Request-Headers': 'accept, authorization',
          'Access-Control-Allow-Origin': 'http://songza.com',
          host: 'transparent-proxy.herokuapp.com',
          connection: 'keep-alive',
          pragma: 'no-cache',
          'cache-control': 'no-cache',
          accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'user-agent': 'Mozilla/5.0 (Windows NT 6.3; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36',
          'accept-encoding': 'gzip, deflate, sdch',
          'accept-language': 'pl-PL,pl;q=0.8,en-US;q=0.6,en;q=0.4',
        },
        json: true,
        url: 'http://transparent-proxy.herokuapp.com/proxy.php?' + queryString
        //qs: queryString
      });
    }
    catch (error) {
      console.log(error.message);
    }
  }
}
