'use strict';

angular.module('applyMyRideApp')
  .controller('WalkController', ['$scope','$routeParams', '$location', 'flash', 'planService', '$http',
    function ($scope, $routeParams, $location, flash, planService, $http) {

        $scope.location = $location.path();
        $scope.disableNext = true;
        $scope.walkid = $routeParams.walkid;
        $scope.showDiv = {};
        $scope.success = true;

      $scope.prepareTrip = function(){
        angular.forEach(planService.searchResults.itineraries, function(itinerary, index) {
          if(itinerary.id == $scope.walkid){
            $scope.itinerary = itinerary;
          }
        });
      }

      if($routeParams.test){
        $http.get('data/itineraries.json').
          success(function(data) {
            planService.searchResults = data;
            planService.prepareTripSearchResultsPage(0);
            $scope.fare_info = planService.fare_info;
            $scope.itinerary = planService.paratransitItinerary;
            $http.get('data/bookingresult.json').
              success(function(data) {
                planService.booking_results = data.booking_results;
                planService.itineraryRequestObject = {};
                planService.itineraryRequestObject.purpose = 'Medical';
                $scope.prepareTrip();
              });
          });
      }else{
        $scope.prepareTrip();
      }

    }
  ]);
