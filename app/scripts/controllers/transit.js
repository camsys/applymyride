'use strict';

angular.module('applyMyRideApp')
  .controller('TransitController', ['$scope','$routeParams', '$location', 'flash', 'planService', '$http','ipCookie', '$attrs',
    function ($scope, $routeParams, $location, flash, planService, $http, ipCookie, $attrs) {

      if($routeParams.departid && $attrs.segmentid > -1){
        $scope.segmentid = $attrs.segmentid;
        $scope.tripid = ($scope.segmentid == 0) 
          ? $routeParams.departid
          : $routeParams.returnid; //$scope.$parent.transitInfos[$attrs.segmentid][0].id;
        $scope.embedded = true;
      }else{
        $scope.segmentid = $routeParams.segmentid;
        $scope.tripid = $routeParams.tripid;
      }
      $scope.location = $location.path();
      $scope.fare_info = planService.fare_info;
      $scope.disableNext = true;
      $scope.showDiv = {};
      $scope.showEmail = false;
      $scope.transitSaved = planService.transitSaved || false;
      $scope.transitCancelled = planService.transitCancelled || false;
      $scope.walkSaved = planService.walkSaved || false;
      $scope.walkCancelled = planService.walkCancelled || false;
      $scope.loggedIn = !!planService.email;


      $scope.reset = function() {
        planService.reset();
        $location.path("/plan/fromDate");
      };

      $scope.toggleEmail = function() {
        $scope.invalidEmail = false;
        $scope.showEmail = !$scope.showEmail;
      };


      $scope.sendEmail = function() {
        if($scope.emailString){
          var result = planService.validateEmail($scope.emailString);
          if(result == true){

            $scope.showEmail = false;
            var addresses = $scope.emailString.split(/[ ,;]+/);
            var emailRequest = {};
            emailRequest.email_itineraries = [];
            angular.forEach(addresses, function(address, index) {
              var emailRequestPart = {};
              emailRequestPart.email_address = address;
              emailRequestPart.itineraries = [];
              var ids = [];
              ids.push(planService.outboundTripId);
              if(planService.returnTripId){
                ids.push(planService.returnTripId);
              }
              angular.forEach(ids, function(id, index) {
                emailRequestPart.itineraries.push({"trip_id":planService.searchResults.trip_id,"itinerary_id":id})
              });
              emailRequest.email_itineraries.push(emailRequestPart)
            });
            var emailPromise = planService.emailItineraries($http, emailRequest);
            emailPromise.error(function(data) {
              bootbox.alert("An error occurred on the server, your email was not sent.");
            });
            flash.setMessage('Your email was sent');
          }else{
            $scope.invalidEmail = true;
          }
        }
      };

      $scope.prepareTrip = function(){
        angular.forEach(planService.searchResults.itineraries, function(itinerary, index) {
          if(itinerary.id == $scope.tripid){
            $scope.transitInfos = planService.transitInfos[$scope.segmentid];
            var priorMode = '';
            var priorEndTime;
            angular.forEach(itinerary.json_legs, function(leg, index) {
              /*if(leg.mode = priorMode && priorMode == 'BUS'){
                var waitTime = leg.startTime - priorEndTime;
                waitTime = humanizeDuration(waitTime * 1000,  { units: ["hours", "minutes"], round: true });
                console.log(waitTime);
              }
              priorMode = leg.mode;
              priorEndTime = leg.endTime;*/
            });
            $scope.itinerary = itinerary;
            $scope.tripid = itinerary.id;
          }
        });
        $scope.roundtrip = planService.fare_info.roundtrip;
      }

      if($location.$$path.indexOf('/transitoptions') > -1) {
        $scope.transitInfos = planService.transitInfos[$scope.segmentid];
        if(planService.fare_info.roundtrip == true){
          if ($scope.segmentid == "0") {
            $scope.message = 'Outbound Bus Options';
          } else {
            $scope.message = 'Return Bus Options';
          }
        }else{
          $scope.message = 'Bus Options';
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
        if($scope.returnTrip != null){
          $scope.itineraries.push($scope.returnTrip);
        }
        $scope.purpose = planService.itineraryRequestObject.trip_purpose;
      }else{
        $scope.prepareTrip();
      }


      $scope.selectTransitTrip = function(tripid, segmentid){
        planService.selectedTripId = tripid;
        if(planService.fare_info.roundtrip == true){
          if(segmentid == "0"){
            planService.outboundTripId = tripid;
            $location.path("/transitoptions/1");
            return;
          }else{
            planService.returnTripId = tripid;
          }
        }else{
          planService.outboundTripId = tripid;
        }
        $scope.saveTransitItinerary()
      }

      $scope.saveToMyRides = function(){
        var itineraries = {}
        var selectItineraries = [];
        
        var tripId = planService.tripId;
        var outboundItineraryId = $routeParams.departid;
        var returnItineraryId = $routeParams.returnid;

        if(outboundItineraryId > 0)
          selectItineraries.push({"trip_id":tripId, "itinerary_id":outboundItineraryId});
        if(returnItineraryId > 0)
          selectItineraries.push({"trip_id":tripId, "itinerary_id":returnItineraryId});

        itineraries.select_itineraries = selectItineraries;

        if(outboundItineraryId < 1 && returnItineraryId < 1){
          bootbox.alert("An error occurred and we were unable to save this trip to your list of rides.  Please try your search again.");
        }
        else {
          var promise = planService.selectItineraries($http, itineraries);
          promise.then(function(result) {
            ipCookie('rideCount', ipCookie('rideCount') + 1);
            $scope.rideCount = ipCookie('rideCount');
            $location.path("/transitconfirm");
          });
        }
      }

      $scope.saveTransitItinerary = function(){
        var tripId = planService.tripId;
        planService.outboundTripId
        var selectedItineraries = [];

        selectedItineraries.push({"trip_id":tripId, "itinerary_id":planService.outboundTripId});
        if(planService.fare_info.roundtrip == true){
          selectedItineraries.push({"trip_id":tripId, "itinerary_id":planService.returnTripId});
        }
        var selectedItineraries = {"select_itineraries": selectedItineraries};
        var promise = planService.selectItineraries($http, selectedItineraries);
        promise.then(function(result) {
          ipCookie('rideCount', ipCookie('rideCount') + 1);
          $scope.rideCount = ipCookie('rideCount');
          $location.path("/transitconfirm");
        });
      }

      $scope.viewTransitTrip = function(tripid, segmentid){
        $location.path("/transit/" + segmentid + "/" + tripid);
      }

      $scope.show = function(event){
        var index = $(event.target).parents('.timeline').attr('index');
        $scope.showDiv[index] = !$scope.showDiv[index];
      }

    }
  ]);
