'use strict';

angular.module('applyMyRideApp')
  .controller('TransitController', ['$scope','$routeParams', '$location', 'flash', 'planService', '$http',
    function ($scope, $routeParams, $location, flash, planService, $http) {

      $scope.segmentid = $routeParams.segmentid;
      $scope.tripid = $routeParams.tripid;
      $scope.location = $location.path();
      $scope.fare_info = planService.fare_info;
      $scope.disableNext = true;
      $scope.showDiv = {};

      $scope.prepareTrip = function(){
        angular.forEach(planService.searchResults.itineraries, function(itinerary, index) {
          if(itinerary.id == $scope.tripid){
            $scope.transitInfos = planService.transitInfos[$scope.segmentid];
            $scope.itinerary = itinerary;
            $scope.tripid = itinerary.id;
          }
        });
        $scope.roundtrip = planService.fare_info.roundtrip;
      }

      if($location.$$path.indexOf('/transitoptions') > -1) {
        $scope.transitInfos = planService.transitInfos[$scope.segmentid];
        if ($scope.segmentid == "0") {
          $scope.message = 'Outbound Bus Options';
        } else {
          $scope.message = 'Return Bus Options';
        }
      }else if($location.$$path.indexOf('/transitconfirm') > -1){
        angular.forEach(planService.searchResults.itineraries, function(itinerary, index) {
          if(itinerary.id == planService.outboundTripId){
            $scope.outboundTrip = itinerary;
          }
          if(itinerary.id == planService.returnTripId){
            $scope.returnTrip = itinerary;
          }
        });
        $scope.itineraries = [];
        $scope.itineraries.push($scope.outboundTrip);
        $scope.itineraries.push($scope.returnTrip);
        $scope.purpose = planService.itineraryRequestObject.trip_purpose;
      }else{
        $scope.prepareTrip();
      }


      $scope.selectTransitTrip = function(tripid, segmentid){
        if(planService.fare_info.roundtrip == true){
          if(segmentid == "0"){
            planService.outboundTripId = tripid;
            $location.path("/transitoptions/1");
          }else{
            planService.returnTripId = tripid;
            $location.path("/transitconfirm");
          }
        }
      }

      $scope.saveTransitItinerary = function(itineraryid){
        var tripId = planService.tripId;
        planService.outboundTripId
        var selectedItineraries = [];

        if(!itineraryid){
          selectedItineraries.push({"trip_id":tripId, "itinerary_id":planService.outboundTripId});

          if(planService.fare_info.roundtrip == true){
            selectedItineraries.push({"trip_id":tripId, "itinerary_id":planService.returnTripId});
          }
        }else{
          selectedItineraries.push({"trip_id":tripId, "itinerary_id":itineraryid});
        }

        var selectedItineraries = {"select_itineraries": selectedItineraries};
        var promise = planService.selectItineraries($http, selectedItineraries);
        promise.then(function(result) {
          $location.path('/plan/my_rides');
        });
      }

      $scope.viewTransitTrip = function(tripid, segmentid){
        $location.path("/transit/" + segmentid + "/" + tripid);
      }

      $scope.show = function($event){
        var index = $(event.target).parents('.timeline').attr('index');
        $scope.showDiv[index] = !$scope.showDiv[index];
      }

    }
  ]);
