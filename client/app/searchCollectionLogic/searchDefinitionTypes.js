/**
 * Created by orcwa on 03.07.2016.
 */

angular.module('musicBucketEngine')
  .service('searchDefinitionTypes', function () {
    function searchDefinitionTypeFieldDefinition(fieldName, dstField) {
      return {
        name: fieldName,
        convert: function fieldConversion(srcData) {
          if (!dstField) return srcData;
          var data = _.omit(srcData, fieldName);
          data[dstField] = srcData[fieldName];
          return data;
        }
      };
    }

    function searchDefinitionTypeDefinition(name, requiredFieldDefinitions, fieldDefinitions) {
      var data = {}, requiredData = {};
      _.each(requiredFieldDefinitions, function (fieldDef) {
        requiredData[fieldDef.name] = fieldDef;
      });
      _.each(fieldDefinitions, function (fieldDef) {
        data[fieldDef.name] = fieldDef;
      });
      return {
        'name': name,
        'data': data,
        'requiredData': requiredData,
        'allFields': function () {
          return _.extend(this.data, this.requiredData);
        },
        'validate': function (searchData) {
          var reqKeys = _.difference(_.keys(this.requiredData), _.keys(searchData));
          var keys = _.intersection(_.keys(this.data), _.keys(searchData));
          if (reqKeys.length) {
            console.warn("Keys: " + reqKeys + " are required in search!");
            return false;
          } else if (!keys.length && _.isEmpty(this.requiredData)) {
            console.warn("At least one of keys: " + keys + " is required!");
            return false;
          } else return true;
        }
      }
    }

    var searchDefinitionTypes = {
      'artist': new searchDefinitionTypeDefinition('Artysta', undefined, [
        new searchDefinitionTypeFieldDefinition('lastFmArtistId'),
        new searchDefinitionTypeFieldDefinition('mbArtistId'),
        new searchDefinitionTypeFieldDefinition('spotifyArtistId'),
      ]),
      'query': new searchDefinitionTypeDefinition('Słowa kluczowe',[
        new searchDefinitionTypeFieldDefinition('query')
      ]),
      'playlist': new searchDefinitionTypeDefinition('Playlista', [
        new searchDefinitionTypeFieldDefinition('query')
      ])
    };
    return searchDefinitionTypes;
  });
