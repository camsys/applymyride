'use strict';

angular.module('applyMyRideApp')
  .factory('sectionsFactory', function ($resource) {
    return $resource('./data/sections.json');
  });

angular.module('applyMyRideApp')
    .service('paratransitApplication', function() {
        var _sections = {};
        this.set = function(sections) {
            _sections = sections;
        };
        this.get = function() {
            return _sections;
        };
    }
);