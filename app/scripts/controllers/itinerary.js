'use strict';

angular.module('applyMyRideApp')
  .controller('ItineraryController', ['$scope','$routeParams', '$location', 'flash', 'planService', '$http',
    function ($scope, $routeParams, $location, flash, planService, $http) {
      $scope.location = $location.path();
      $scope.trip = planService.selectedTrip;
      angular.forEach($scope.trip.itineraries, function(itinerary, index) {
        planService.prepareItinerary(itinerary);
      });
      if($scope.trip.mode == 'mode_transit'){
        $scope.itineraries = $scope.trip.itineraries;
      }else if($scope.trip.mode == 'mode_walk'){
        $scope.walkItineraries = $scope.trip.itineraries;
      }else if($scope.trip.mode == 'mode_paratransit'){
        $scope.paratransitItineraries = $scope.trip.itineraries;
      }
      $scope.mode = $scope.trip.mode;
    }
  ]);
