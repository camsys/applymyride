'use strict';

angular.module('applyMyRideApp')
  .controller('EligibilityController', ['$scope', '$location', '$routeParams', 'eligibilityQuestionsFactory', 'sectionsFactory',
    function($scope, $location, $routeParams, eligibilityQuestionsFactory, sectionsFactory) {
      sectionsFactory.get(function(data) {
        console.log(data.sections);
      });
    }
  ]);
