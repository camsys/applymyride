'use strict';

// var app = angular.module('applyMyRideApp');

// This directive displays a lookup tool for users to find their lost Ecolane ID.
app.directive('lookupId', function () {
  return {
    restrict: "E",
    scope: false,
    templateUrl: "views/lookup-id.html"
    // link: function(scope, element, attrs) {
    //   scope.lookupId = function() {
    //     console.log("Looking Up User ID...", scope, element, attrs);
    //     var promise = $http.get('//'+APIHOST+'/api/v1/lookup');
    //     console.log("PROMISE:", promise);
    //   };
    // }
  };
});
