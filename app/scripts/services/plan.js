'use strict';

angular.module('applyMyRideApp')
    .service('planService', function() {
        var _sections = {};
        this.set = function(sections) {
            _sections = sections;
        };
        this.get = function() {
            return _sections;
        };
    }
);