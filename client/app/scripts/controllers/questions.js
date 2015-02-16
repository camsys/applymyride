'use strict';

angular.module('applyMyRideApp')
  .controller('QuestionsController', ['$scope', '$location', '$routeParams', 'sectionsFactory',
    'paratransitApplication',
    function($scope, $location, $routeParams, sectionsFactory, paratransitApplication) {
      sectionsFactory.get(function(data) {
        $scope.sections = paratransitApplication.get();
        if (Object.keys($scope.sections).length===0) {
          $scope.sections = data.sections;
        }
      });
      $scope.sectionId = $routeParams.sectionId;
      $scope.nextSection = '/questions/' + (parseInt($scope.sectionId) + 1);

      $scope.save = function(sections, nextSection) {
        paratransitApplication.set(sections);
        $location.path(nextSection);
      };
    }
  ]);
  