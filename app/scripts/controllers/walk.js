'use strict';

angular.module('applyMyRideApp')
  .controller('WalkController', ['$scope','$routeParams', '$location', 'flash', 'planService', '$http',
    function ($scope, $routeParams, $location, flash, planService, $http) {

        $scope.location = $location.path();
        $scope.disableNext = true;
        $scope.showDiv = {};
        $scope.success = true;

      $scope.prepareTrip = function(){
        $scope.walkItineraries = planService.walkItineraries;
        $scope.purpose = planService.itineraryRequestObject.trip_purpose;
      }

      $scope.saveWalkItinerary = function(){
        $scope.walkItineraries = planService.walkItineraries;
        var selectedItineraries = [];
        var tripId = planService.tripId;
        angular.forEach(planService.walkItineraries, function(itinerary, index) {
          selectedItineraries.push({"trip_id":tripId, "itinerary_id":itinerary.id});
        });

        var selectedItineraries = {"select_itineraries": selectedItineraries};
        var promise = planService.selectItineraries($http, selectedItineraries);
        promise.then(function(result) {
          $location.path('/plan/my_rides');
        });
      }

      $scope.emailWalkItinerary = function(){

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
