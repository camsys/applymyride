'use strict';

angular.module('clientApp')
  .factory('sectionsFactory', function ($resource) {
    return $resource('./data/sections.json');
  });

angular.module('clientApp')
    .service('paratransitApplication', function() {
        var _sections = {};
        this.set = function(sections) {
            _sections = sections;
        }
        this.get = function() {
            return _sections;
        }
    }
);