var _ = require('lodash');
var stationSchema = require('../../../songzaLurker/models/station.model');

exports.get = function (req, res) {
  stationSchema
    .findById(req.params.id)
    .populate('songs')
    .exec(function (err, station) {
      if (err) return res.json(500, err);
      if (!station) return res.json(404, {err: "station " + req.params.id + " not found!"});
      return res.json(200, station);
    });

};

exports.search = function (req, res) {
  var limit = req.query.limit || 50;
  delete req.query.limit;
  if (_.isEmpty(req.query))
    return res.json(500, {err: "search query not specified"});

  stationSchema
    .findByQueryString(req.query)
    .limit(limit)
    .exec(function(err, stations) {
      if (err) return res.json(500, err);
      return res.json(200, stations);
    });
}
