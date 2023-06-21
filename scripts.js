'use strict';

/**
 * @ngdoc overview
 * @name applyMyRideApp
 * @description
 * # applyMyRideApp
 *
 * Main module of the application.
 */
angular.module('applyMyRideApp', [
    'ngAnimate',
    'ngAria',
    'ipCookie',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'angularSpinner',
    'ui.map',
    'ui.utils',
    'autocomplete',
    'ui.bootstrap',
    'dcbClearInput',
    'LocalStorageModule',
    'ng.deviceDetector',
    'ngBootbox',
    'ngIdle',
  ]).config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/login.html',
        controller: 'MainController'
      })
      /** NOTE: sandbox.html is for checking how app components look
        UNCOMMENT THE BELOW IF YOU WANT TO SEE HOW UI ELEMENTS LOOK IN FMR
        NOTE: NOT FOR USE LIVE
       */
      // .when('/', {
      //   templateUrl: 'views/sandbox.html',
      // })
      // .when('/sandbox', {
      //   templateUrl: 'views/sandbox.html',
      // })
      .when('/loginError', {
        templateUrl: 'views/login.html',
        controller: 'MainController'
      })
      .when('/authenticateSharedRideId', {
        templateUrl: 'views/login.html',
        controller: 'LoginController'
      })
      .when('/lookupIdForm', {
        templateUrl: 'views/lookup-id.html',
        controller: 'LookupIdController'
      })
      .when('/lookupError', {
        templateUrl: 'views/lookup-id.html',
        controller: 'LookupIdController'
      })
      .when('/plan', {
        templateUrl: 'views/plan.html',
        controller: 'PlanController'
      })
      .when('/plan/:step/error', {
        templateUrl: 'views/planning-error.html',
        controller: 'PlanController'
      })
      .when('/plan/:step/:departid/:returnid', {
        templateUrl: 'views/transit-detail.html',
        controller: 'PlanController'
      })
      .when('/plan/:step', {
        templateUrl: 'views/plan.html',
        controller: 'PlanController'
      })
      .when('/transit/:departid', {
        templateUrl: 'views/transit.html',
        controller: 'TransitController'
      })
      .when('/transit-old/:segmentid/:tripid', {
        templateUrl: 'views/transit.html',
        controller: 'TransitController'
      })
      .when('/transitoptions/:segmentid', {
        templateUrl: 'views/transitoptions.html',
        controller: 'TransitController'
      })
      .when('/transitconfirm', {
        templateUrl: 'views/transitconfirm.html',
        controller: 'TransitController'
      })
      .when('/transit/details/:tripid', {
        templateUrl: 'views/transitconfirm.html',
        controller: 'TransitController'
      })
      .when('/paratransit/:tripid', {
        templateUrl: 'views/paratransit.html',
        controller: 'ParatransitController'
      })
      .when('/walk/confirm', {
        templateUrl: 'views/walk.html',
        controller: 'WalkController'
      })
      .when('/walk/details/:tripid', {
        templateUrl: 'views/walk.html',
        controller: 'WalkController'
      })
      .when('/taxi', {
        templateUrl: 'views/taxi-detail.html',
        controller: 'TaxiController'
      })
      .when('/uber', {
        templateUrl: 'views/uber-detail.html',
        controller: 'UberController'
      })
      .when('/itinerary', {
        templateUrl: 'views/itinerary.html',
        controller: 'ItineraryController'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutController'
      })
      .when('/about/sharedride', {
        templateUrl: 'views/about.html',
        controller: 'AboutController'
      })
      .when('/about/projecthistory', {
        templateUrl: 'views/about.html',
        controller: 'AboutController'
      })
      .when('/profile', {
        templateUrl: 'views/profile.html',
        controller: 'ProfileController'
      })
      // Add other routes here
      .otherwise({
        redirectTo: '/' // redirect to the root path if no other routes match
      });

  })  //global event handler
  .run(function($rootScope, $window, $location, ipCookie, $route) {
    // Hamburger menu toggle
    $(".navbar-nav li a").click(function(event) {
      // check if window is small enough so dropdown is created
      var toggle = $(".navbar-toggle").is(":visible");
      if (toggle) {
        $(".navbar-collapse").collapse("hide");
      }
    });
  
    $window.$rootScope = $rootScope;
    var exceptions = [
      "/plan/my_rides",
      "/about",
      "/about/sharedride",
      "/about/projecthistory"
    ];
    $rootScope.$on("$routeChangeStart", function(event) {
      if (!$window.visited) {
        if (exceptions.indexOf($location.$$path) < 0) {
          $location.path("/");
        }
      }
  
      // TODO (Drew Teter, 09/22/2022) Fully Remove ability for guest login.
      // We plan on doing this in the future. But, as no tickets have been created
      // for this task yet, I'm just putting a redirect here as a temporary fix.
  
      var publicPages = [
        "/",
        "/loginError",
        "/about",
        "/about/sharedride",
        "/about/projecthistory",
        "/lookupIdForm",
        "/lookupError"
      ];
      var notLoggedIn = !ipCookie("authentication_token");
  
      if (notLoggedIn && publicPages.indexOf($location.$$path) === -1) {
        event.preventDefault();
        $location.path("/");
        return false;
      }
    });
  
    $rootScope.$on("$routeChangeSuccess", function() {
      var titleMap = {
        'purpose': 'Trip Purpose',
        'when': 'Trip Schedule',
        'companions': 'Trip Companions',
        'instructions_for_driver': 'Driver Instructions',
        'summary': 'Trip Summary',
        'my_rides': 'My Rides',
        'itinerary': 'Itinerary',
        'profile': 'Profile',
        'about': 'About',
        'transitconfirm': 'Transit Confirmation',
        'where': 'Trip Location',
      };
      var currentPath = $location.path();
      var currentStep = currentPath.split('/').pop();
      var title = titleMap[currentStep] || "FMR Schedule";
      document.title = title;
    });
  });
;
'use strict';

angular.module('applyMyRideApp')
	.controller('MainController', ['$scope',
		function($scope) {
      $scope.foo = {}; // just to quiet jshint
		}
	]);
	
;
'use strict';

var app = angular.module('applyMyRideApp');

angular.module('applyMyRideApp')
  .controller('NavbarController', ['$scope', '$rootScope', '$location', 'flash', 'planService', 'deviceDetector', 'ipCookie', '$window',
    function ($scope, $rootScope, $location, flash, planService, deviceDetector, ipCookie, $window) {

      var input = document.createElement('input');
      input.setAttribute('type','date');
      var notADateValue = 'not-a-date';
      input.setAttribute('value', notADateValue);
      $scope.debugoff = !!APIHOST.match(/demo/);
      $scope.html5 = !(input.value === notADateValue);
      planService.html5 = $scope.html5;
      $scope.mobile = deviceDetector.isMobile();
      $scope.isUnsupportedBrowser = deviceDetector.browser.normalize() == "ie";
      planService.mobile = $scope.mobile;

      $scope.flash = flash;

      var that = this;
      that.$scope = $scope;

      $rootScope.$on("CallLogout", function() {
        $scope.logout();
      });

      $scope.reset = function() {
        planService.reset();
        $location.path("/plan/where");
      };

      $scope.showNavbar = function() {
        that.$scope.email = ipCookie('email');
        that.$scope.authentication_token = ipCookie('authentication_token');
        that.$scope.first_name = ipCookie('first_name');
        that.$scope.last_name = ipCookie('last_name');
        that.$scope.full_name = `${ipCookie('first_name')} ${ipCookie('last_name')}`
        that.$scope.sharedRideId = ipCookie('sharedRideId');
        if(that.$scope.email){
          planService.email = $scope.email;
          planService.authentication_token = $scope.authentication_token;
        }else{
          that.$scope.email = planService.email;
          that.$scope.authentication_token = planService.authentication_token;
          that.$scope.first_name = planService.first_name;
          that.$scope.last_name = planService.last_name;
          that.$scope.last_name = planService.last_name;
          that.$scope.sharedRideId = planService.sharedRideId;
          that.$scope.walkingDistance = planService.walkingDistance;
          that.$scope.walkingSpeed = planService.walkingSpeed;
        }
        var currentBalancePathConditions = ['confirm_shared_ride', 'itinerary', 'plan', 'profile'];
        $scope.currentBalance = ipCookie('currentBalance');
        $scope.showCurrentBalance = that.$scope.email && currentBalancePathConditions.some(el => $location.path().includes(el)) 
          && ($scope.currentBalance != null);
        $scope.rideCount = ipCookie('rideCount');
        $scope.liveTrip = ipCookie('liveTrip');
        return true;
      };

      $scope.logout = function() {
        delete ipCookie.remove('email');
        delete ipCookie.remove('authentication_token');
        delete ipCookie.remove('currentBalance');
        sessionStorage.clear();
        localStorage.clear();
        delete $scope.email;
        delete planService.email;
        planService.killEtaChecker();
        $window.location.href = "#/";
        $window.location.reload();
        planService.to = '';
        planService.from = '';
      };

    }]);

angular.module('applyMyRideApp').factory('flash', function($rootScope) {
  var currentMessage = '';

  $rootScope.$on('$routeChangeSuccess', function() {
    currentMessage = null;
  });

  return {
    setMessage: function(message) {
      //queue.push(message);
      currentMessage = message;
    },
    getMessage: function() {
      return currentMessage;
    }
  };
});

app.directive('back', ['$window', function($window) {
  return {
    restrict: 'A',
    link: function (scope, elem) {
      elem.bind('click', function () {
        $window.history.back();
      });
    }
  };
}

]);

;
'use strict';

var app = angular.module('applyMyRideApp');

app.controller('AboutController', ['$scope', '$http','$routeParams', '$location', 'planService', 'util', 'flash', 'usSpinnerService', '$q', 'LocationSearch', 'localStorageService', 'ipCookie', '$timeout', '$window', '$filter',

function($scope, $http, $routeParams, $location, planService, util, flash, usSpinnerService, $q, LocationSearch, localStorageService, ipCookie, $timeout, $window, $filter) {

  $scope.step = $routeParams.step;
  $scope.planService = planService;

  $scope.location = $location.path();
  $scope.errors = {};
  if ($scope.location === '/about') {
    util.getCounties(
      function(response) {
        var counties = response.data.service_ids;
        $scope.counties = counties;
        localStorageService.set('counties', counties);
      }
    );
    $scope.counties = localStorageService.get('counties') || [];
    $scope.county_count = ''
    if ($scope.counties.length === 0) {
        $scope.county_count = '0 counties'
    } else if ($scope.counties.length === 1) {
        $scope.county_count = '1 counties'
    } else {
        $scope.county_count = $scope.counties.length + ' counties'
    }
    $scope.counties_string = $scope.counties.length > 0 ?
        $scope.counties.reduce(function(acc, val, ind) {
            if (ind === $scope.counties.length - 1) {
                return acc + val
            } else {
              return acc + val + ', '
            }
        },'') : ''
  }

}
]);

;
'use strict';

var app = angular.module('applyMyRideApp');

app.controller('PlanController', ['$scope', '$http','$routeParams', '$location', 'planService', 'util', 'flash', 'usSpinnerService', 'debounce', '$q', 'LocationSearch', 'localStorageService', 'ipCookie', '$timeout', '$window', '$filter',
  function($scope, $http, $routeParams, $location, planService, util, flash, usSpinnerService, debounce, $q, LocationSearch, localStorageService, ipCookie, $timeout, $window, $filter) {
    // This variable exists to track whether or not we're still on initial focus with a default input
    let isOnInitFocus = true
    var currentLocationLabel = "Current Location";
    var urlPrefix = '//' + APIHOST + '/';

    var eightAm = new Date();
    var countryFilter = $filter('noCountry');
    var checkShowMap = function(){
      if(Object.keys( $scope.toFromMarkers ).length == 0){
        $scope.showMap = false;
      }
    }
    eightAm.setSeconds(0);
    eightAm.setMinutes(0);
    eightAm.setHours(8);
    eightAm.setDate( eightAm.getDate() - 1 );
    $scope.minReturnDate = new Date();
    $scope.locationClicked = true;
    $scope.marker = null;
    $scope.toFromMarkers = {};
    $scope.toFromIcons={'to' : '//maps.google.com/mapfiles/markerB.png',
                        'from' : '//maps.google.com/mapfiles/marker_greenA.png' };
    // Disable Swap Address determines when to disable the swap address inputs button
    $scope.disableSwapAddressButton = false
    /**
     * NOTE: THE FMR CODEBASE HANDLES ASYNCHRONOUS CODE VERY BADLY
     * - you'll see setTimeout in the codebase to handle asynchronous actions a lot
     * ...and that's generally not the correct way to handle async actions
     * - Ideally we'd return Promises and use then chaining to handle async code and callbacks
    */
    // have 2 separate locations suggestions arrays for each field rather than having a single locations array
    $scope.fromLocations = [];
    $scope.toLocations = [];
    $scope.placeIds = [];
    $scope.showConfirmLocationMap = false;
    // Desktop/ global map config
    // All other map options get their default values
    $scope.mapOptions = {
      zoom: 11,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    //disable some map options if mobile user
    if(util.isMobile()){
      $scope.mapOptions.scrollwheel = false; // Disable Scroll wheel
      $scope.mapOptions.navigationControl = false; // Config option doesn't exist anymore?
      $scope.mapOptions.mapTypeControl = false; // Disable Map Type controls
      $scope.mapOptions.scaleControl = false; // Disable the Scale Control
    }
    $scope.step = $routeParams.step;
    $scope.disableNext = false;
    $scope.showNext = true;
    $scope.showEmail = false;
    $scope.invalidEmail = false;
    $scope.showBack = false;
    $scope.planService = planService;
    $scope.fromMoment = moment( planService.fromDate || eightAm );
    $scope.returnMoment = null;
    $scope.serviceHours = null;
    $scope.fromTime = '';
    if(planService.fromDate && planService.returnDate){
      $scope.howLongMinutes = moment(planService.returnDate).diff( planService.fromDate, 'minutes');
      $scope.howLong = {minutes: ''+ $scope.howLongMinutes };
    }else{
      $scope.howLong = {minutes:'0'};
    }
    $scope.howLongOptions = [];
    $scope.fromDate = new Date();
    $scope.returnDate = new Date();
    $scope.showMap = false;
    $scope.location = $location.path();
    $scope.errors = {};
    $scope.showAllPurposes = false;
    $scope.backToConfirm = planService.backToConfirm;
    $scope.loggedIn = !!planService.email;
    $scope.tripId = planService.tripId

    $scope.toDefault = countryFilter( localStorage.getItem('last_destination') || '');
    $scope.to = countryFilter( planService.to || '');
    $scope.fromDefault = countryFilter( localStorage.getItem('last_origin') || '' );
    $scope.from = countryFilter( planService.from || '' );
    $scope.transitSaved = planService.transitSaved || false;
    $scope.transitCancelled = planService.transitCancelled || false;
    $scope.walkSaved = planService.walkSaved || false;
    $scope.walkCancelled = planService.walkCancelled || false;

    //plan/confirm bus options selected-tab placeholder
    $scope.selectedBusOption = planService.selectedBusOption || [0,0];
    if ($scope.step === 'transit') {
      planService.getUserNotificationDefaults($http).then(() => {
        $scope.fixedRouteReminderPrefs = planService.syncFixedRouteNotifications(null, new Date(planService.fromDate))
      })
    }

    $scope.reset = function() {
      planService.reset();
      $location.path("/plan/where");
    };

    $scope.goPlanWhere = function(){
      planService.backToConfirm = true;
      $location.path('/plan/where');
    }
    $scope.goPlanWhen = function(){
      planService.backToConfirm = true;
      $location.path('/plan/when');
    }
    $scope.goPlanPurpose = function(){
      planService.backToConfirm = true;
      $location.path('/plan/purpose');
    }
    $scope.goViewTransitOptions = function(){
      $location.path('/plan/transit_details');
    }
    $scope.goViewTransit = function(departId, returnId){
      //get the transit depart/return ids using the selectedBusOption (current tabs)
      departId = $scope.transitInfos[0][ $scope.selectedBusOption[0] ].id;
      if( $scope.transitInfos[1] && $scope.transitInfos[1][ $scope.selectedBusOption[1] ] ){
        returnId = $scope.transitInfos[1][ $scope.selectedBusOption[1] ].id;
      }else{
        returnId = 0;
      }
      $location.path('/plan/transit/'+departId+'/'+returnId);
    }
    $scope.goViewTaxi = function(taxiOption){
      if(taxiOption > -1){
        planService.selectedTaxiOption = taxiOption;
      }else{
        planService.selectedTaxiOption = planService.selectedTaxiOption || 0;
      }
      $location.path('/taxi');
    }
    $scope.goViewUber = function(uberOption){
      if(uberOption > -1){
        planService.selectedUberOption = uberOption;
      }else{
        planService.selectedUberOption = planService.selectedUberOption || 0;
      }
      $location.path('/uber');
    }

    $scope.goPlanLogin = function(){
      $location.path('/');
    }

    $scope.goViewWalk = function(departId, returnId){
      $location.path('/plan/walk/'+departId+'/'+returnId);
    }

    $scope.updateReturnTime = function(o){
      if(!o){return;}
      var destinationDuration = parseInt(o.minutes);
      if(destinationDuration > 0){
        $scope.returnMoment = $scope.fromMoment.clone().add( destinationDuration, 'm' );
        planService.returnDate = $scope.returnMoment.toDate();
        planService.returnTime = $scope.returnMoment.toDate();
      }else{
        $scope.returnMoment = null;
        planService.returnDate = null;
        planService.returnTime = null;
      }
      planService.howLong = destinationDuration;
    }

    $scope.rebook = function($event, tab, index) {
      planService.rebookTrip = $scope.trips[tab][index];
      $scope.step = 'rebook';
      $location.path('/plan/rebook');
    };

    $scope.updateTransitTripReminders = function($event) {
      $event.preventDefault()
      // build new trip details object
      const oldNotifications = $scope.transitTripDetails || {}
      const tripDetails = {
        notification_preferences: {
          ...oldNotifications,
          fixed_route: $scope.fixedRouteReminderPrefs.reminders
        }
      }
      // grab trip id(s) and build update trip request object
      const updateTripRequest = {trip: planService.tripId, details: tripDetails}
      const planPromise = planService.updateTripDetails($http, updateTripRequest)
        planPromise.then(function(results) {
          $scope.transitTripDetails = results.data.trip[0].details.notification_preferences
          $scope.fixedRouteReminderPrefs = planService.syncFixedRouteNotifications($scope.transitTripDetails, new Date(planService.fromDate))
          bootbox.alert("Trip notification preferences updated!")
        })
    }

    $scope.cancelThisBusOrRailTrip = function() {
      usSpinnerService.spin('spinner-1');
      var cancelRequest = {bookingcancellation_request: []};
      var leg1, leg2;
      leg1 = {itinerary_id: planService.transitItineraries[0][ $scope.selectedBusOption[0] ].id};
      cancelRequest.bookingcancellation_request.push( leg1 );
      if(planService.fare_info.roundtrip){
        leg2 = {itinerary_id: planService.transitItineraries[1][ $scope.selectedBusOption[1] ].id};
        cancelRequest.bookingcancellation_request.push( leg2 );
      }
      var cancelPromise = planService.cancelTrip($http, cancelRequest)
      cancelPromise.error(function(data) {
        bootbox.alert("An error occurred, your trip was not cancelled.  Please call 1-844-PA4-RIDE for more information.");
        usSpinnerService.stop('spinner-1');
      });
      cancelPromise.success(function(data) {
        bootbox.alert('Your trip has been cancelled');
        ipCookie('rideCount', ipCookie('rideCount') - 1);
        $scope.transitSaved = false;
        $scope.transitCancelled = true;
        planService.transitSaved = false;
        planService.transitCancelled = true;
        usSpinnerService.stop('spinner-1');
      })
    }

    $scope.cancelThisWalkTrip = function() {
      usSpinnerService.spin('spinner-1');
      var cancelRequest = {bookingcancellation_request: []};
      var leg1, leg2;
      leg1 = {itinerary_id: planService.walkItineraries[0].id};
      cancelRequest.bookingcancellation_request.push( leg1 );
      if(planService.fare_info.roundtrip){
        leg2 = {itinerary_id: planService.walkItineraries[1].id};
        cancelRequest.bookingcancellation_request.push( leg2 );
      }
      var cancelPromise = planService.cancelTrip($http, cancelRequest)
      cancelPromise.error(function(data) {
        bootbox.alert("An error occurred, your trip was not cancelled.  Please call 1-844-PA4-RIDE for more information.");
        usSpinnerService.stop('spinner-1');
      });
      cancelPromise.success(function(data) {
        bootbox.alert('Your trip has been cancelled');
        ipCookie('rideCount', ipCookie('rideCount') - 1);
        $scope.walkSaved = false;
        $scope.walkCancelled = true;
        planService.walkSaved = false;
        planService.walkCancelled = true;
        usSpinnerService.stop('spinner-1');
      })
    }

    $scope.cancelTrip = function(){
      $scope.trip = planService.selectedTrip;
      var message = "Are you sure you want to cancel this ride?";

      if(planService.fare_info.roundtrip ||  $scope.outboundCancelled ||  $scope.returnCancelled){
        // NOTE: NOT RESTYLING THIS TO MATCH THE PDS AS THE PDS'S RADIO BUTTONS ARE MUCH MORE INVOLVED
        //... AND MAKING BOOTBOX MATCH THAT DOES NOT SEEM EASILY DOABLE
        // DEAL WITH Round Trips
        bootbox.prompt({
            title: message,
            message: '<p>Please select an option below:</p>',
            inputType: 'radio',
            inputOptions: [
            {
                text: 'Cancel Entire Trip',
                value: 'BOTH',
            },
            {
                text: 'Cancel Outbound Trip Only',
                value: 'OUTBOUND',
            },
            {
                text: 'Cancel Return Trip Only',
                value: 'RETURN',
            }
            ],
            buttons: {
                'cancel': {
                  label: 'Keep Ride'
                },
                'confirm': {
                  label: 'Cancel Ride'
                }
            },
            callback: function(result){
              $scope.cancelCall(result);
            }
        });
      } else {
        // DEAL WITH 1 Way Trips
        bootbox.confirm({
          message: message,
          buttons: {
            'cancel': {
              label: 'Keep Ride'
            },
            'confirm': {
              label: 'Cancel Ride'
            }
          },
          callback: function(result){
            $scope.cancelCall('BOTH');
          }
        });
      }
    }

    $scope.cancelCall = function(result){
      var itinsToCancel; 
      var successMessage;
      if(result == 'BOTH'){
        itinsToCancel = $scope.trip.itineraries;
        successMessage = 'Your trip has been cancelled.';
      }
      else if(result == 'OUTBOUND'){
        itinsToCancel = [$scope.trip.itineraries[0]];
        successMessage = 'Your outbound trip has been cancelled.';
      } else if(result == 'RETURN'){
        itinsToCancel = [$scope.trip.itineraries[$scope.trip.itineraries.length - 1]];
        successMessage = 'Your return trip has been cancelled.';
      }
      
      var cancel = {};

      cancel.bookingcancellation_request = [];
      angular.forEach(itinsToCancel, function(itinerary, index) {
        var bookingCancellation = {};
        if(($scope.trip.mode == 'mode_transit' || $scope.trip.mode == 'mode_taxi' || $scope.trip.mode == 'mode_ride_hailing' || $scope.trip.mode == 'mode_walk') && itinerary.id){
          bookingCancellation.itinerary_id = itinerary.id;
        }
        else if($scope.trip.mode == 'mode_paratransit' && itinerary.booking_confirmation){
          bookingCancellation.booking_confirmation = itinerary.booking_confirmation;
        }
        cancel.bookingcancellation_request.push(bookingCancellation);
      });
      var cancelPromise = planService.cancelTrip($http, cancel)
      cancelPromise.error(function(data) {
        bootbox.alert("An error occurred, your trip was not cancelled.  Please call 1-844-PA4-RIDE for more information.");
      });
      cancelPromise.success(function(data) {
        bootbox.alert(successMessage);
        if(result == 'BOTH'){
          $scope.tripCancelled = true;
          ipCookie('rideCount', ipCookie('rideCount') - 1);
        }
        else if(result == 'OUTBOUND'){
          $scope.outboundCancelled = true;
        }else if(result == 'RETURN'){
          $scope.returnCancelled = true;
        }
      })
    }

    $scope.selectTrip = function($event, tab, index) {
      $event.stopPropagation();
      var trip = $scope.trips[tab][index];
      trip.tab = tab;
      planService.selectedTrip = trip;
      switch(trip.mode) {
        case 'mode_paratransit':
          break;
        case 'mode_transit':
          break;
        case 'mode_walk':
          break;
      }
      $location.path('/itinerary');
    };

    $scope.toggleEmail = function($event) {
      $scope.invalidEmail = false;
      $scope.showEmail = !$scope.showEmail;
      $event.stopPropagation();
    };

    $scope.sendEmail = function($event) {
      $event.stopPropagation();

      var emailString = $scope.emailString;

      if(emailString && planService.tripId){
        var result = planService.validateEmail(emailString);
        if(result == true){

          $scope.showEmail = false;

          var emailRequest = {};
          emailRequest.email_address = emailString;
          emailRequest.trip_id = planService.tripId;

          var emailPromise = planService.emailItineraries($http, emailRequest);
          emailPromise.error(function(data) {
            bootbox.alert("An error occurred on the server, your email was not sent.");
          });
          bootbox.alert('Your email was sent');
        }else{
          $scope.invalidEmail = true;
        }
      }
    }

    $scope.openCalendar = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.opened = true;
    };

    $scope.openReturnCalendar = function($event) {
      $event.preventDefault();
      $event.stopPropagation();
      $scope.openedReturn = true;
    };

    $scope.setNoReturnTrip = function(){
      planService.returnDate = null;
      planService.returnTime = null;
      $location.path('/plan/confirm');
    }

    $scope.dateOptions = {
      formatYear: 'yy',
      startingDay: 0,
      showWeeks: false,
      showButtonBar: false
    };

    $scope.getFromDateString = function(){
      return $scope.getDateString(planService.fromDate, planService.fromTime, planService.fromTimeType)
    }

    $scope.getOtherRidersString = function(){
      var otherRiders = [];

      if (planService.hasEscort) {
        otherRiders.push('Approved escort');
      }

      if (planService.hasCompanions) {
        if (planService.numberOfCompanions === 1) { 
          otherRiders.push(planService.numberOfCompanions + ' companion');
        } else {
          otherRiders.push(planService.numberOfCompanions + ' companions');
        }
      }

      return otherRiders.length > 0 ? otherRiders.join(', ') : 'No companions';
    }

    $scope.getReturnDateString = function(){
      return $scope.getDateString(planService.returnDate, planService.returnTime, planService.returnTimeType )
    }

    $scope.getDateString = function(date, time, type){
      var fromDateString = null
      if(date){
        fromDateString = moment(date).format('M/D/YYYY');
        if(type == 'asap'){
          fromDateString += " - As soon as possible"
        }else if(type == 'depart'){
          fromDateString += " - Depart at " + moment(time).format('h:mm a');
        }else if(type == 'arrive'){
          fromDateString += " - Arrive at " + moment(time).format('h:mm a');
        }
      }
      return fromDateString;
    }

    $scope.next = function() {
      if($scope.disableNext){ return; }
      $scope.showNext = false;

      var params = {};
      // Where
      if (planService.fromDetails) {
        let {lat, lng} = planService.fromDetails.geometry.location;
        params.origin = {lat, lng};
      }
      if (planService.toDetails) {
        let {lat, lng} = planService.toDetails.geometry.location;
        params.destination = {lat, lng};
      }
      // Purpose
      if (planService.purpose) params.purpose = planService.purpose;
      // When
      if ($scope.fromMoment) params.date = $scope.fromMoment.format('dddd-MM-D');
      if ($scope.fromTimeUpdated) params.start_time = $scope.fromMoment.format('h:mm:ss');

      switch($scope.step) {
        case 'where':
          // delete params.purpose;
          delete params.date;
          delete params.start_time;

          planService.getTravelPatterns($http, params)
                      .then((res) => {
                        $location.path('/plan/purpose');
                      })
                      .catch((err) => {
                        $location.path('/plan/where/error');
                      });
          break;
        case 'purpose':
          delete params.date;
          delete params.start_time;
          
          planService.getTravelPatterns($http, params)
                      .then((res) => {
                        let travelPatterns = res.data.data;
                        let dates = travelPatterns.map(pattern => Object.keys(pattern.to_calendar)).flat();
                        let sorted_dates = [...new Set(dates)].sort();
                        let lastDay = moment(sorted_dates[sorted_dates.length-1]);
                        let months = [];
                        let monthOffset = moment(sorted_dates[0], "YYYY-MM-DD").month();
                        let weekIndex = 0;

                        sorted_dates.forEach((dateString) => {
                          let date = moment(dateString, "YYYY-MM-DD");
                          let monthIndex = (date.month()-monthOffset+12)%12;
                          let day = date.date();
                          let weekday = date.weekday();

                          if (months[monthIndex] === undefined) {
                            months[monthIndex] = {
                              name: date.format("MMMM"),
                              weeks: [],
                              key: date.format("YYYY-MM"),
                            };

                            weekIndex = 0;
                          }

                          let month = months[monthIndex];
                          if (month.weeks[weekIndex] === undefined) {
                            month.weeks[weekIndex] = new Array(7);
                            for(let i=0; i<weekday; i++) {
                              let tempDate = date.clone().subtract(weekday-i, "Days");
                              month.weeks[weekIndex][i] = {
                                key: tempDate.format("YYYY-MM-DD"),
                                day: tempDate.date()
                              };
                            } 
                          }

                          let week = month.weeks[weekIndex]
                          week[weekday] = {
                            key: date.format("YYYY-MM-DD"),
                            day: day,
                            moment: date,
                            startTime: Math.min(...travelPatterns.map(pattern => pattern.to_calendar[dateString].start_time)),
                            endTime: Math.max(...travelPatterns.map(pattern => pattern.to_calendar[dateString].end_time))
                          }

                          if (day == date.daysInMonth() || date.isSame(lastDay)) {
                            for(let i=weekday+1; i<7; i++) {
                              let tempDate = date.clone().add(i-weekday, "Days");
                              week[i] = {
                                key: tempDate.format("YYYYMM-DD"),
                                day: tempDate.date()
                              };
                            }
                          }
                          if (weekday == 6) { weekIndex += 1; }
                        });

                        planService.months = months
                        $location.path('/plan/when');
                      })
                      .catch((err) => {
                        $location.path('/plan/purpose/error');
                      });
          break;
        case 'when':
          _bookTrip().success((sec) => {
            $scope.paratransitResult = planService.paratransitResult;
            $scope.hasEscort = false;
            $scope.hasCompanions = false;
            planService.prepareTripSearchResultsPage();
            $location.path('/plan/companions');
          }).error((err, statusCode) => {
            // When the backend throws a 409: Conflict error, it's because there's a conflict with
            // an already booked trip.
            if(statusCode === 409) {
              $location.path('/plan/overlapping_trip/error');
            } else {
              $location.path('/plan/when/error');
            }
          });
          break;
        case 'companions':
          // The Companions page doesn't use a "next" button
          // See "specifySharedRideCompanions"
          break;
        case 'assistant':
          planService.hasEscort = $scope.hasEscort;
          planService.hasCompanions = $scope.hasCompanions;

          if($scope.hasCompanions){
            planService.numberOfCompanions = $scope.numberOfCompanions || 0;
          }else{
            planService.numberOfCompanions = 0;
          }

          $location.path('/plan/instructions_for_driver');
          break;
        case 'instructions_for_driver':
          planService.driverInstructions = $scope.driverInstructions;
          _bookTrip().success((sec) => {
            $scope.stopSpin();
            $scope.paratransitResult = planService.paratransitResult;
            planService.prepareTripSearchResultsPage();
            $location.path('/plan/summary');
          }).error((err) => {
            $scope.stopSpin();
            console.log(err);
            $location.path('/plan/instructions_for_driver/error');
          });
          break;
        case 'summary':
          let res = planService.bookSharedRide($http);
          $scope.startSpin();

          res.success((result) => {
            $scope.stopSpin();
            $location.path('/plan/my_rides');
          }).error((err) => {
            $scope.stopSpin();
            console.log(err);
            $location.path('/plan/summary/error');
          });
          break;
      }
      return;
    };

    $scope.back = function (step) {
      $scope.showNext = true;
      if (step === 'overlapping_trip') { step = 'when'; }

      if (step === undefined) {
        step = 'where';
        switch($scope.step) {
          case 'when':
            step = 'purpose';
            break;
          case 'companions':
            step = 'when';
            break;
          case 'assistant':
            step = 'companions';
            break;
          case 'instructions_for_driver':
            step = (planService.hasEscort || planService.numberOfCompanions > 0) ? 'assistant' : 'companions';
            break;
          case 'summary':
            step = 'instructions_for_driver';
            break;
        }
      }

      switch (step) {
        case 'where':
          delete planService.purpose;
          planService.resetPurpose();
        case 'purpose':
          $scope.fromMoment = null;
          $scope.fromTimeUpdated = null;
          planService.serviceOpen = null;
          planService.serviceClose = null;
          planService.resetWhen();
        case 'when':
          planService.resetOther();
        case 'companions':
          $scope.hasEscort = false;
          $scope.hasCompanions = false;
          delete $scope.numberOfCompanions;
          planService.resetCompanions();
        case 'assistant':
        case 'instructions_for_driver':
        case 'summary':
          break;
      }

      $location.path('/plan/'+step);
    };

    $scope.saveBusOrRailTrip = function(){
      var tripId = planService.tripId;
      var selectedItineraries = [{"trip_id":tripId, "itinerary_id":planService.transitInfos[0][ $scope.selectedBusOption[0] ].id}];

      if(planService.fare_info.roundtrip == true){
        selectedItineraries.push({"trip_id":tripId, "itinerary_id":planService.transitInfos[1][ $scope.selectedBusOption[1] ].id});
      }
      var selectedItineraries = {"select_itineraries": selectedItineraries};

      var promise = planService.selectItineraries($http, selectedItineraries);
      promise.then(function(result) {
        ipCookie('rideCount', ipCookie('rideCount') + 1);
        $scope.rideCount = ipCookie('rideCount');
        $scope.transitSaved = true;
        planService.transitSaved = true;
        bootbox.alert("Your trip has been saved", $scope.goViewTransit());
      });
    }

    $scope.saveWalkTrip = function(){
      var tripId = planService.tripId;
      var selectedItineraries = [{"trip_id":tripId, "itinerary_id":planService.walkItineraries[0].id}];

      if(planService.fare_info.roundtrip == true){
        selectedItineraries.push({"trip_id":tripId, "itinerary_id":planService.walkItineraries[1].id});
      }
      var selectedItineraries = {"select_itineraries": selectedItineraries};

      var promise = planService.selectItineraries($http, selectedItineraries);
      promise.then(function(result) {
        ipCookie('rideCount', ipCookie('rideCount') + 1);
        $scope.rideCount = ipCookie('rideCount');
        $scope.walkSaved = true;
        planService.walkSaved = true;
        var departId = planService.walkItineraries[0].id;
        var returnId = planService.walkItineraries[1] ? planService.walkItineraries[1].id : 0;
        bootbox.alert("Your trip has been saved", $scope.goViewWalk(departId, returnId));
      });
    }

    // Rebuild and recenter the map
    function rebuildRecenterMap() {
      const map = $scope.whereToMap
      const bounds = new google.maps.LatLngBounds();
      Object.values($scope.toFromMarkers).forEach(function(marker) {
        bounds.extend(marker.position);
      })
      map.setCenter(bounds.getCenter());
      map.fitBounds(bounds);
      if(Object.keys($scope.toFromMarkers).length === 1 ){
        map.setZoom(15);
      }
    }

    function _bookTrip () {
      try {
        planService.prepareSummaryPage($scope);
      } catch (e) {
        bootbox.alert('The origin/destination address does not have a city included. Please go back and use a different address with a city included.');
        return Promise.reject('Could not find a city in the location components.');
      }
      planService.transitResult = [];
      planService.paratransitResult = null;
      usSpinnerService.spin('spinner-1');

      let promise = planService.postItineraryRequest($http);
      return promise.
        success(function(result) {
          var i;
          for (i=0; i<result.itineraries.length; i+=1) {
            result.itineraries[i].origin = planService.getAddressDescriptionFromLocation(result.itineraries[i].start_location);
            result.itineraries[i].destination = planService.getAddressDescriptionFromLocation(result.itineraries[i].end_location);
            if (result.itineraries[i].returned_mode_code == "mode_paratransit") {
              // If the trip purpose is eligible based on the valid date range, allow booking a shared ride. 
              // Otherwise, display no shared ride message.
              var allPurposes = [...planService.top_purposes || [], ...planService.purposes || []];
              var tripPurposesFiltered = allPurposes.filter(e => e.code == planService.itineraryRequestObject.trip_purpose);
              if (tripPurposesFiltered.length > 0) {
                var tripPurposeObj = tripPurposesFiltered[0]
                window.test = tripPurposeObj
                if (tripPurposeObj.valid_from && tripPurposeObj.valid_until &&
                  result.itineraries[i].start_time >= tripPurposeObj.valid_from &&
                  result.itineraries[i].start_time <= tripPurposeObj.valid_until) {
                    // Check both dates if available.
                    planService.paratransitResult = result.itineraries[i];
                } else if (tripPurposeObj.valid_from && result.itineraries[i].start_time >= tripPurposeObj.valid_from) {
                    // Otherwise check from date if available.
                    planService.paratransitResult = result.itineraries[i];
                } else if (!tripPurposeObj.valid_from && !tripPurposeObj.valid_until) {
                    // If date range is not available, assume it's eligible.
                    planService.paratransitResult = result.itineraries[i];
                }
              }
            } else {
              planService.transitResult.push(result.itineraries[i]);
            }
          }
          planService.searchResults = result;
          usSpinnerService.stop('spinner-1');
        }).
        error(function(err, statusCode) {
          if(statusCode == 500) {
            bootbox.alert("An error occured on the server, please retry your search or try again later.");
          }
          usSpinnerService.stop('spinner-1');
        });
    }

    // CONFIRM
    // remove backToConfirm? remove isEditTrip?
    /**
     * @param {string} purpose - A string representing the trip purpose
     * @param {boolean} [isEditTrip] - An optional arg that a dev can include
     * ...to specify that the function call is the result of a user editing the trip purpose
     * - In the context of fixing PAMF-709, we're passing in $scope.backToConfirm to check
     * ...to make sure that we're not editing the trip
     *
     * Regardless of whether or not the trip is being edited, the trip purpose is updated
     * - if we are editing a trip, we should call next() and let that function call handle rebooking the trip
     * ...in order to prevent the app from trying to double book an updated trip(and subsequently hanging)
     * - if we are not editing a trip, then book the trip as normal
     */
    $scope.specifyTripPurpose = function(purpose, isEditTrip){
      planService.purpose = purpose;
    }

    $scope.specifyFromTimeType = function(type){
      $scope.fromTimeType = type;
      if(type == 'asap'){
        $scope.fromTime = new Date();
        $scope.fromTime.setMinutes($scope.fromTime.getMinutes() + 10);
        $scope.next();
      }
    }

    $scope.specifyReturnTimeType = function(type){
      $scope.returnTimeType = type;
      planService.returnTimeType = type;
    }

    $scope.clearFrom = function(){
      //$scope.showMap = false;
      $scope.showNext = false;
      $scope.from = null;
    }

    $scope.clearTo = function(){
      //$scope.showMap = false;
      $scope.showNext = false;
      $scope.to = null;
    }

    $scope.getFromLocations = function(typed){
      $scope.getLocations(typed, true, 'from');
    }

    $scope.getToLocations = function(typed){
      $scope.getLocations(typed, false, 'to');
    }

    $scope.getLocations = function(typed, addCurrentLocation, toFrom){
      if(typed){
        // The user has typed something, don't let the Next button activate until they have selected a location.
        $scope.locationClicked = false;
        
        var config = planService.getHeaders();
        //if this is run before the last promise is resolved, abort the promise, start over.
        var getLocationsPromise = LocationSearch.getLocations(typed, config, planService.email != null);
        getLocationsPromise.then(function(data){

          $scope.placeLabels = [];
          $scope.placeIds = [];
          $scope.placeAddresses = [];
          $scope.poiData = [];

          var choices = [];

          if(addCurrentLocation && util.isMobile()){
            choices.push({label: currentLocationLabel, option: true})
          }

          // Saved Places: These are POIs from 1-Click 
          var savedPlaceData = data[1].savedplaces;
          if(savedPlaceData && savedPlaceData.length > 0){
            choices.push({label:'Saved Places', option: false});
            angular.forEach(savedPlaceData, function(savedPlace, index) {
              choices.push({label:savedPlace, option: true});
            }, choices);
            $scope.placeLabels = $scope.placeLabels.concat(savedPlaceData);
            $scope.placeIds = $scope.placeIds.concat(data[1].placeIds);
            $scope.poiData = data[1].poiData;
            $scope.placeAddresses = $scope.placeAddresses.concat(data[1].savedplaceaddresses);
          }

          // Recent Searches are stored locally.  
          if(data.length > 2){
            var recentSearchData = data[2].recentsearches;
            if(recentSearchData && recentSearchData.length > 0){
              choices.push({label:'Recently Searched', option: false});
              angular.forEach(recentSearchData, function(recentSearch, index) {
                choices.push({label:recentSearch, option: true});
              }, choices);
              $scope.placeLabels = $scope.placeLabels.concat(recentSearchData);
              $scope.placeIds = $scope.placeIds.concat(data[2].placeIds);
              $scope.placeAddresses = $scope.placeAddresses.concat(recentSearchData);
            }
          }

          // These come from Google auto complete
          var googlePlaceData = data[0].googleplaces;
          if(googlePlaceData.length > 0){
            choices.push({label:'Suggestions', option: false});
            angular.forEach(googlePlaceData, function(googleplace, index) {
              choices.push({label:googleplace, option: true});
            }, choices);
            $scope.placeLabels = $scope.placeLabels.concat(googlePlaceData);
            $scope.placeIds = $scope.placeIds.concat(data[0].placeIds);
            $scope.placeAddresses = $scope.placeAddresses.concat(googlePlaceData);
          }

          if (toFrom === 'from') {
            $scope.fromLocations = choices
          } else if (toFrom === 'to') {
            $scope.toLocations = choices
          }
        });
        return getLocationsPromise;
      }
      return false;
    }
    //begin private scope for keeping track of last input, and mapping when appropriate
    var lastFrom = $scope.from || $scope.fromDefault;
    var lastTo = $scope.to || $scope.toDefault;
    var lastMappedPlaces = {};
    var ignoreBlur=false;

    function mapOnBlur( place, toFrom )
    {
      var defaulted = false;
      //blur handler runs each time the autocomplete input is blurred via selecting, or just blurring
      //If it was blurred because of a selection, we don't want it to run -- let the selectTo or selectFrom run instead
      //return if no change, return if place is empty, or we're supposed to ignore blur events
      if( (place && lastMappedPlaces[toFrom] === place) || true === ignoreBlur){
        //hide the place marker if place is empty or too short
        if((!place || 1 > place.length) && $scope.toFromMarkers[toFrom]){
          $scope.toFromMarkers[toFrom].setMap(null);
        }
        checkShowMap();
        lastMappedPlaces[toFrom] = place;
        ignoreBlur = false;
        return;
      }else if(!place){
        place = $scope[toFrom + 'Default'];
        defaulted = true;
      }else{
        $scope.showNext = false;
      }
      lastMappedPlaces[toFrom] = place; 
      setTimeout(function selectPlace(){
        //if $scope.to or $scope.from is different from place, the autocomplete input's select events are handling
        if(!defaulted && $scope[toFrom] !== place){
          return;
        // Else if we are on initial focus(i.e the from input is focused, inputs are still on defaults, and we clicked out of it)
        // ... toggle isOnInitFocus to false  and then return
        } if (isOnInitFocus === true && (place === $scope.fromDefault || place === $scope.toDefault)) {
          isOnInitFocus = false
          return
        }
        //otherwise, run selectPlace
        $scope.selectPlace(place, toFrom);
      }, 500);
    }

    // Determines whether or not to grey out the "Yes, looks good!" Button
    // This runs each time a character is typed in the to/from fields
    // It's also run when you hover over the map
    $scope.whereShowNext = function(){
      if(!$scope.locationClicked){
        return false;
      }

      if( !$scope.toFromMarkers.from || !$scope.toFromMarkers.to){
        return false;
      }
      return (!!$scope.toFromMarkers.from.map && !!$scope.toFromMarkers.to.map);
    }

    $scope.mapFrom = function(place){
      if(lastFrom != place){
        setTimeout(function(){
          mapOnBlur(place, 'from');
        }, 300);
      }
    }
    $scope.mapTo = function(place){
      if(lastTo != place){
        setTimeout(function(){
          mapOnBlur(place, 'to');
        }, 300);
      }
    }
    $scope.focusTo = function(e){
      lastTo = e.target.value;
    }
    $scope.focusFrom = function(e){
      lastFrom = e.target.value;
    }

    $scope.selectFrom = function(place){
      ignoreBlur = true;
      $scope.selectPlace(place, 'from');
      // If the user selected a place, then re-enable swap button
      $scope.disableSwapAddressButton = false
    }

    $scope.selectTo = function(place){
      ignoreBlur = true;
      $scope.selectPlace(place, 'to');
      // If the user selected a place, then re-enable swap button
      $scope.disableSwapAddressButton = false
    }

    /**
     * NOTE: implementation is similar to how $scope.checkServiceArea is implemented
     * ... only it's fully synchronous whereas checkServiceArea performs at least one asynchronous action
     */
    function swapMapMarkers() {
      const tempToDetails = {...planService.toDetails}
      const tempToName = planService.to
      const tempToDisplay = $scope.to !== '' ? $scope.to : $scope.toDefault
      const tempFromDetails = {...planService.fromDetails}
      const tempFromName = planService.from
      const tempFromDisplay = $scope.from !== '' ? $scope.from : $scope.fromDefault
      // rebuild map markers
      const map = $scope.whereToMap;
      Object.values($scope.toFromMarkers).forEach(function(marker) {
        marker.setMap(null)
      })

      // Check to ensure that at least the default inputs are present and if not, alert the user
      if (Object.keys(tempToDetails).length === 0 || Object.keys(tempFromDetails).length === 0 ) {
        bootbox.alert('One or more address inputs is empty. Please ensure both inputs have a valid address selected.')
        return
      }
      const fromLocation = tempFromDetails.geometry.location
      const toLocation = tempToDetails.geometry.location
      google.maps.event.trigger(map, 'resize');

      // Check if POI's have been selected, or if the location is in a format that isn't recognized by google maps
      const toLatType = typeof toLocation.lat === 'number' || typeof toLocation.lat === 'string' 
      const fromLatType = typeof fromLocation.lat === 'number' || typeof fromLocation.lat === 'string' 

      const newFromLocation = toLatType ? new google.maps.LatLng(Number(toLocation.lat), Number(toLocation.lng)) : toLocation
      const newToLocation = fromLatType ? new google.maps.LatLng(Number(fromLocation.lat), Number(fromLocation.lng)) : fromLocation

      // Rebuild map markers
      $scope.toFromMarkers.to = new google.maps.Marker({
        map: map,
        position: newToLocation,
        animation: google.maps.Animation.DROP,
        icon: $scope.toFromIcons.to
      });

      $scope.toFromMarkers.from = new google.maps.Marker({
        map: map,
        position: newFromLocation,
        animation: google.maps.Animation.DROP,
        icon: $scope.toFromIcons.from
      });

      // Rebuild map
      rebuildRecenterMap()

      // Swap to/ from
      planService.fromDetails = tempToDetails
      planService.from = tempToName;
      $scope.from = tempToDisplay;
      $scope.fromLocations = []

      planService.toDetails = tempFromDetails;
      planService.to = tempFromName;
      $scope.to = tempFromDisplay;
      $scope.toLocations = []
    }

    /**
     * Debounce swap address inputs
     * - it's asynchronous as the function holds off on executing the swap
     * ...operation for a bit to prevent from repeated calls within a short amount of time
     */
    $scope.debouncedSwapAddressInputs = async function() {
      // NOTE: DISABLE "Yes Looks Good" BUTTON
      $scope.locationClicked = false
      if ($scope.disableSwapAddressButton) {
        bootbox.alert("At least one address in the origin/ destination fields is invalid. Please search for another address and be sure to select one from the suggestions list.")
        return
      }
      $scope.disableSwapAddressButton = true
      await debounce(swapMapMarkers, 450)().then(function() {
        $scope.disableSwapAddressButton = false
        $scope.locationClicked = true
      })
    }

    const validateCityPresence = function(place) {
      const addressComponents = place.address_components
      const ADMIN_AREA_3 = 'administrative_area_level_3'
      const PENN = 'Pennsylvania'
      const locality = addressComponents.find(function(component) {
        const includesLocality = component.types.includes('locality') && component.long_name != null
        const includesAdminArea = component.types.includes(ADMIN_AREA_3) && component.long_name !== PENN && component.long_name !== 'US'  && component.long_name != null
        if (includesLocality || includesAdminArea) {
          return true
        } else {
          return false
        }
      });
    return locality != null
    }
    /**
     * Select Place
     * - This is run when you click a place in the list,
     * ...when you tap out of the to/from field,
     * ...and when the to/from page is loaded
     * - if the place is selected successfully
     * ...$scope.checkServiceArea is called
     * @param {string} place - an address
     * @param {string} toFrom - limited to a value of 'to' or 'from
     * @param {unknown} loadLocationsIfneeded - unsure
     */
    $scope.selectPlace = function(place, toFrom, loadLocationsIfNeeded){
      // Check to see if we have reset to the original place. If so, we can turn the button back on.
      if(toFrom == 'from'){
        if(place === $scope.fromDefault && place.length > 0){
          $scope.locationClicked = true
        }
      }else{
        if(place === $scope.toDefault && place.length > 0){
          $scope.locationClicked = true
        }
      }

      //when a place is selected, update the map
      $scope.poi = null;
      $scope.showMap = true;
      $scope.showNext = false;
      var placeIdPromise = $q.defer();
      $scope.placeLabels = $scope.placeLabels || [];

      // If we are on mobile, you can use the current location 
      if(toFrom == 'from' && util.isMobile()){
        $scope.placeLabels.push(currentLocationLabel);
        $scope.locationClicked = true;
      }

      $scope.errors['noResults'+toFrom] = false;
      if($scope.toFromMarkers[toFrom]){
        $scope.toFromMarkers[toFrom].setMap(null);
      }
      if(!place){
        checkShowMap();
        return;
      }
      var selectedIndex = $scope.placeLabels.indexOf(place);
      
      // The person selected the current location.
      if(-1 < selectedIndex && $scope.placeLabels[selectedIndex] == currentLocationLabel){
        $scope.getCurrentLocation(toFrom);
        $scope.locationClicked = true;
      }
      // The person selected a POI
      else if(-1 < selectedIndex && selectedIndex < $scope.poiData.length){
        const hasCity = validateCityPresence($scope.poiData[selectedIndex])
        if (hasCity) {
          $scope.locationClicked = true;
          $scope.poi = $scope.poiData[selectedIndex];
          $scope.checkServiceArea($scope.poi, $scope.poi.formatted_address, toFrom);
        } else {
          bootbox.alert("Selected Point of Interest has no city, please search for another address.")
          return
        }
      }
      // The person selected either a recent place or a Google Place.
      else{
        var placeId = $scope.placeIds[selectedIndex];
        // The person selected a Google Place
        if(placeId) {
          placeIdPromise.resolve(placeId);
          $scope.locationClicked = true;
        }
        else{
        // The person did not select a Google Place
        // This means that we are going to use the string to determnie the location manually, or that a recent place was selected
        // This is used when the page is first loaded to get the lat/lng of the recently used place.
          var labelIndex = $scope.placeLabels.indexOf(place);
          var autocompleteService = new google.maps.places.AutocompleteService();
          var address;
          //if no place has been found, use place as address (manual input)
          if(-1 === labelIndex){
            address = place;
          }else{
            //A Recent place was selected
            address = $scope.placeAddresses[labelIndex];
            $scope.locationClicked = true;
          }

          autocompleteService.getPlacePredictions(
            {
              input: address,
              bounds: new google.maps.LatLngBounds(
                        // ALL PA
                        new google.maps.LatLng(39.719799, -80.519895),
                        new google.maps.LatLng(42.273734, -74.689502)
                      )
            }, function(list, status)
            {
              if(status == "ZERO_RESULTS" || list == null){
                if(loadLocationsIfNeeded){
                  //try again, loading the locations then selecting place
                  var locationsPromise = $scope.getLocations(place)
                  if(locationsPromise!==false){
                    locationsPromise.then(function(){
                      $scope.selectPlace(place, toFrom, false);
                    });
                    //exit before errors, new selectPlace will handle things
                    return;
                  }
                }
                $scope.errors['noResults'+toFrom] = true;
                $scope.disableSwapAddressButton = true
                checkShowMap();
              }else{
                var placeId = list[0].place_id;
                placeIdPromise.resolve(placeId);
              }
            });
        }

        // After a location has been picked or entered into the to/from field, we then Geocode that location
        // TODO: Why are we re-geocoding? If the autocomplete/Poi already has a lat/lng, this isn't necessary
        // This is only necessary for manual entry, which we no longer do.
        placeIdPromise.promise.then(function(placeId) {
          var placesService = new google.maps.places.PlacesService($scope.whereToMap);
          placesService.getDetails({
            'placeId': placeId, fields: ['address_component', 'geometry', 'vicinity', 'place_id', 'type', 'name'],
          }, function (result, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              /* Verify that a street number and a locality/ city exists in the returned place */
              const datatypes = [];
              let route;
              angular.forEach(result.address_components, function(component, index) {
                angular.forEach(component.types, function(type, index) {
                  // if the component isn't empty, then push it into datatypes and parse the route
                  if (component.long_name != null) {
                    datatypes.push(type);
                    if(type == 'route'){
                      route = component.long_name;
                    }
                  }
                });
              });

              if(datatypes.indexOf('street_number') < 0 || datatypes.indexOf('route') < 0){
                if(datatypes.indexOf('route') < 0){
                  $scope.toFromMarkers[toFrom].setMap(null);
                  checkShowMap();
                  bootbox.alert("The location you selected does not have have a street associated with it, please select another location.", function() {
                    $scope.disableSwapAddressButton = true
                  });
                  return;
                }else if(datatypes.indexOf('street_number') < 0){
                  var streetNameIndex = place.indexOf(route);
                  if(streetNameIndex > -1){
                    var prefix = place.substr(0, streetNameIndex);
                    prefix = prefix.trim();
                    var streetComponent = {};
                    streetComponent.short_name = prefix;
                    streetComponent.long_name = prefix;
                    streetComponent.types = [];
                    streetComponent.types.push('street_number');
                    result.address_components.push(streetComponent);
                  }else{
                    if($scope.toFromMarkers[toFrom]){
                      $scope.toFromMarkers[toFrom].setMap(null);
                    }
                    checkShowMap();
                    bootbox.alert("The location you selected does not have a street number associated, please select another location.", function() {
                      $scope.disableSwapAddressButton = true
                    });
                    return;
                  }
                }
              } else if (datatypes.indexOf('locality') < 0 && datatypes.indexOf('administrative_area_level_3') < 0) {
                checkShowMap();
                bootbox.alert("The location you selected does not have a city associated to it, please select another location.");
                return;
              }

              // When we start typing we hide the Yes, looks good! button. 
              // If we made it back here without selecting a place, then we shouldn't let the person continue.
              // When the page is first loaded, then this is used to populate the lat/lng for the previous locations, since the showButton is true by default, the button will be green assuming all other tests pass.
              if ($scope.locationClicked) {
                $scope.checkServiceArea(result, place, toFrom);
                $scope.disableSwapAddressButton = false;
                return;
              } else {
                bootbox.alert("Please select a location from the dropdown to continue.", function() {
                  $scope.disableSwapAddressButton = true
                });
                return;
              }

            } else {
              alert('Geocode was not successful for the following reason: ' + status);
            }
          });
        })
      }
    }

    $scope.getCurrentLocation = function(toFrom) {
      if (navigator.geolocation) {
        $scope.startSpin();
        //navigator.geolocation.getCurrentPosition($scope.setOriginLocation(showPosition, 'from'), $scope.showError);
        navigator.geolocation.getCurrentPosition(function (position) {
          var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
          var geocoder = new google.maps.Geocoder();
          var placeIdPromise = $q.defer();
          geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              if (results[0]) {
                var result = results[0];
                var place = result.formatted_address;

                if(result.place_id){
                  placeIdPromise.resolve();
                }
                else{
                  $scope.stopSpin();
                }

                placeIdPromise.promise.then($scope.mapAddressByPlaceId(result.place_id, place, toFrom, true));
              }
            }
          })
        }, $scope.showError);
      } else {
        $scope.error = "Geolocation is not supported by this browser.";
      }
    }

    $scope.mapAddressByPlaceId = function(placeId, place, toFrom, updateInput) {
      updateInput = util.assignDefaultValueIfEmpty(updateInput, false);
      var placesService = new google.maps.places.PlacesService($scope.whereToMap);
      placesService.getDetails( { 'placeId': placeId}, function(result, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          //verify the location has a street address
          var datatypes = [];
          var route;
          angular.forEach(result.address_components, function(component, index) {
            angular.forEach(component.types, function(type, index) {
              datatypes.push(type);
              if(type == 'route'){
                route = component.long_name;
              }
            });
          });

          if(datatypes.indexOf('street_number') < 0 || datatypes.indexOf('route') < 0){
            if(datatypes.indexOf('route') < 0){
              $scope.toFromMarkers[toFrom].setMap(null);
              bootbox.alert("The location you selected does not have have a street associated with it, please select another location.", function() {
                $scope.disableSwapAddressButton = true
              });
              $scope.stopSpin();
              return;
            }
            else if(datatypes.indexOf('street_number') < 0){
              var streetNameIndex = place.indexOf(route);
              if(streetNameIndex > -1){
                var prefix = place.substr(0, streetNameIndex);
                prefix = prefix.trim();
                var streetComponent = {};
                streetComponent.short_name = prefix;
                streetComponent.long_name = prefix;
                streetComponent.types = [];
                streetComponent.types.push('street_number');
                result.address_components.push(streetComponent);
              }
              else{
                $scope.toFromMarkers[toFrom].setMap(null);
                checkShowMap();
                bootbox.alert("The location you selected does not have a street number associated, please select another location.", function() {
                  $scope.disableSwapAddressButton = true
                });
                $scope.stopSpin();
                return;
              }
            }
          }
          $scope.checkServiceArea(result, place, toFrom, updateInput);
        }
        else {
          alert('Geocode was not successful for the following reason: ' + status);
          $scope.stopSpin();
        }
      });
    }

    // Take in a Google Place object and return the format that is shown
    // in the to/from fields in FMR
    $scope.getDisplayAddress = function(gPlace){
      var name = gPlace['name'] 
      var vicinity = gPlace['vicinity'];
      var formatted_address = gPlace['formatted_address']
      var city = null;

      // The formatted address works if the place doesn't have a name.
      if((name == null || name == "") && formatted_address != null){
        return formatted_address
      }

      // If we have a name and vicinity for the gPlace, return them.
      if(name != null && vicinity != null){
        return name + ', ' + vicinity;
      }

      // Find the City name from the address_components.
      // In the Google framework, the city name can be 'locality' or 'administrative_area_level_3' if 'locality' isn't present
      angular.forEach(gPlace['address_components'], function(value, key) {
        var types = value['types'];
        if($.inArray('locality',types) >= 0){
          city = value['long_name']
        } else if($.inArray('administrative_area_level_3',types) >= 0){
          city = value['long_name']
        }
      })

      // Check to see if we found a city name and return the string.
      if(name != null && city != null ){
        return name + ', ' + city;
      }
      else{
        return "undefined"
      }
    }

    $scope.checkServiceArea = function (result, place, toFrom, updateInput) {
      updateInput = util.assignDefaultValueIfEmpty(updateInput, false);
      if (result.formatted_address === undefined) { result.formatted_address = place; }
      var serviceAreaPromise = planService.checkServiceArea($http, result);
      $scope.showNext = false;
      serviceAreaPromise.
        success(function(serviceAreaResult) {
          if(serviceAreaResult.result == true){
            $scope.errors['rangeError'+toFrom] = false;
            var recentSearches = localStorageService.get('recentSearches');
            if(!recentSearches){
              recentSearches = {};
            }

            if (typeof(recentSearches[place]) == 'undefined'){
              recentSearches[place] = result;
              localStorageService.set('recentSearches', JSON.stringify(recentSearches));
            }

            var map = $scope.whereToMap;
            if($scope.toFromMarkers[toFrom]){
              $scope.toFromMarkers[toFrom].setMap(null);
            }

            $scope.showMap = true;
            $scope.showUndo = true;
            $scope.disableNext = false;
            $scope.showNext = true;

            setTimeout(function(){
              google.maps.event.trigger(map, 'resize');
              var location = result.geometry.location;//$.extend(true, [], result.geometry.location); //new google.maps.LatLng(result.geometry.location.lat, result.geometry.location.lng);
              if($scope.poi){
                var poilocation = $scope.poi.geometry.location;
                location = new google.maps.LatLng(Number(poilocation.lat), Number(poilocation.lng));
              }

              if(typeof location.lat == "number"){
                location = new google.maps.LatLng(Number(location.lat), Number(location.lng));
              }

              $scope.toFromMarkers[toFrom] = new google.maps.Marker({
                map: map,
                position: location,
                animation: google.maps.Animation.DROP,
                icon: $scope.toFromIcons[toFrom]
              });

              rebuildRecenterMap()
              if (toFrom == 'from') {
                planService.fromDetails = result;
                planService.from = place;
                // Update the typed text to reflect the geocoded place
                $("#whereFromInput").val($scope.getDisplayAddress(result));
                // Reset locations array
                $scope.fromLocations = []
              } else if (toFrom == 'to') {
                planService.toDetails = result;
                planService.to = place;
                // Update the typed text to reflect the geocoded place
                $("#whereToInput").val($scope.getDisplayAddress(result));
                // Reset locations array
                $scope.toLocations = []
              }
            }, 1);
          } else {
            //$scope.showMap = false;
            $scope.showNext = false;
            if ($scope.toFromMarkers[toFrom]) {
              $scope.toFromMarkers[toFrom].setMap(null);
            }
            checkShowMap();
            $scope.errors['rangeError'+toFrom] = true;
            bootbox.alert("The location you selected is outside the service area.");
            $scope.stopSpin();
          }
          $scope.stopSpin();
        }).
        error(function(serviceAreaResult) {
          bootbox.alert("An error occured on the server, please retry your search or try again later.");
          $scope.stopSpin();
        });
    }

    $scope.showError = function (error) {
      switch (error.code) {
        case error.PERMISSION_DENIED:
          $scope.error = "User denied the request for Geolocation."
          break;
        case error.POSITION_UNAVAILABLE:
          $scope.error = "Location information is unavailable."
          break;
        case error.TIMEOUT:
          $scope.error = "The request to get user location timed out."
          break;
        case error.UNKNOWN_ERROR:
          $scope.error = "An unknown error occurred."
          break;
      }
      $scope.$apply();
      $scope.stopSpin();
    }

    $scope.isMobile = function(){
      return /Mobi/.test(navigator.userAgent);
    }

    $scope.startSpin = function(){
      usSpinnerService.spin('spinner-1');
    }

    $scope.stopSpin = function(){
      usSpinnerService.stop('spinner-1');
    }

    $scope.logout = function() {
      delete ipCookie.remove('email');
      delete ipCookie.remove('authentication_token');
      sessionStorage.clear();
      localStorage.clear();
      delete $scope.email;
      delete planService.email;
      $window.location.href = "#/";
      $window.location.reload();
      planService.to = '';
      planService.from = '';
    };

    $scope.specifySharedRideCompanion = function(hasCompanion) {
      if(hasCompanion == 'true'){
        $location.path("/plan/assistant");
        $scope.step = 'assistant';
      }else{
        $location.path("/plan/instructions_for_driver");
        $scope.step = 'instructions_for_driver';
      }
    }

    $scope.selectSharedRide = function() {
      $location.path("/plan/companions");
      $scope.step = 'companions';
    }

    $scope.overrideCurrentLocation = function() {
      planService.from = null;
      planService.fromDetails = null;
      $location.path("/plan/from");
      $scope.step = 'from';
    };

    $scope.submitRebookedTrip = function(){
      $scope.message = null;

      var fromDate = $scope.fromDate;
      if(!fromDate){
        $scope.message = 'Please enter a departure date.';
        return;
      }

      var fromTime = $scope.fromTime;
      if(!fromTime){
        $scope.message = 'Please enter a departure time.';
        return;
      }

      fromTime.setYear(fromDate.getFullYear());
      fromTime.setMonth(fromDate.getMonth());
      fromTime.setDate(fromDate.getDate());

      if(planService.rebookTrip.itineraries.length > 1){
        var returnTime = $scope.returnTime;
        var returnDate = $scope.returnDate;

        returnTime.setYear(returnDate.getFullYear());
        returnTime.setMonth(returnDate.getMonth());
        returnTime.setDate(returnDate.getDate());

        if(!returnDate){
          $scope.message = 'Please enter a return date.';
          return;
        }

        if(!returnTime){
          $scope.message = 'Please enter a return time.';
          return;
        }

        if(returnTime.getTime() < fromTime.getTime()){
          $scope.message = 'You requested a return trip that starts before your departure.  Please enter a valid return date and time.';
          return;
        }
      }

      var request = {};
      var trip = planService.rebookTrip;
      request.trip_purpose = trip.trip_purpose_raw;
      request.itinerary_request = [];
      var outboundTrip = {};
      outboundTrip.segment_index = 0;
      outboundTrip.start_location = trip.itineraries[0].origin;
      outboundTrip.end_location = trip.itineraries[0].destination;
      outboundTrip.assistant = trip.itineraries[0].assistant;
      outboundTrip.companions = trip.itineraries[0].companions;
      outboundTrip.note = trip.itineraries[0].note;

      var fromTimeString = moment.utc(fromTime).format();
      outboundTrip.trip_time = fromTimeString;
      outboundTrip.departure_type = trip.itineraries[0].requested_time_type;
      request.itinerary_request.push(outboundTrip);

      if(trip.itineraries.length > 1){
        var returnTrip = {};
        returnTrip.segment_index = 1;
        returnTrip.start_location = trip.itineraries[1].origin;
        returnTrip.end_location = trip.itineraries[1].destination;
        returnTrip.departure_type = trip.itineraries[1].requested_time_type;
        returnTrip.assistant = trip.itineraries[0].assistant;
        returnTrip.companions = trip.itineraries[0].companions;
        returnTrip.note = trip.itineraries[0].note;
        var returnTimeString = moment.utc(returnTime).format();
        returnTrip.trip_time = returnTimeString;
        request.itinerary_request.push(returnTrip);
      }
      planService.itineraryRequestObject = request;
      usSpinnerService.spin('spinner-1');
      var promise = planService.postItineraryRequest($http);
      promise.
        success(function(result) {
          planService.searchResults = result;
          var paratransitItineraries = [];

          angular.forEach(result.itineraries, function(itinerary, index) {
            if(itinerary.returned_mode_code == "mode_paratransit"){
              paratransitItineraries.push(itinerary);
            }
          }, paratransitItineraries);
          if(paratransitItineraries.length != trip.itineraries.length){
            bootbox.alert("No shared ride is available for your request. Please call 1-844-PA4-RIDE for more information.");
            usSpinnerService.stop('spinner-1');
          }else{
            planService.paratransitItineraries = paratransitItineraries;
            var promise = planService.bookSharedRide($http);
            promise.then(function(result) {
              planService.booking_results = result.data.booking_results;
              planService.hasEscort = trip.itineraries[0].assistant;
              planService.numberOfCompanions = trip.itineraries[0].companions;
              planService.driverInstructions = trip.itineraries[0].note;
              $location.path('/paratransit/confirm_shared_ride');
            });
          }
        })
    }

    $scope.selectDepartDate = function(day){
      if(!(day.startTime || day.startTime == 0)) { return; } // Return if the start time doesn't exist
      if(!(day.endTime > 0)) { return; } // Return if the end time doesn't exist

      let hour, minute;
      let serviceOpen = {hour: day.startTime / 3600, minute: (day.startTime % 3600) / 60};
      let serviceClose = {hour: day.endTime / 3600, minute: (day.startTime % 3600) / 60};

      //try to re-use the selected time if there is one, otherwise use the start time as a default
      if($scope.fromMoment && !$scope.fromMoment.isSame( moment(), 'day' )) {
        minute = $scope.fromMoment.minute();
        hour = $scope.fromMoment.hour();
      } else {
        hour = serviceOpen.hour;
        minute = serviceOpen.close;
      }

      planService.serviceOpen = day.moment.clone().set(serviceOpen)
      planService.serviceClose = day.moment.clone().set(serviceClose)
      $scope.fromMoment = day.moment.clone();
      $scope.fromMoment.hour( hour ).minute( minute ).seconds(0);

      setTimeout(function(){
        $('input.cs-hour').select();
      }, 100);
    }

    function _setupHowLongOptions(){
      var time, startingTime, endOfDay, beginOfDay, minDiff, hrsDiff, name, selectedIndex;
      //can only setup howlong if fromMoment is within service hours
      if(!$scope.fromMoment || !planService.serviceOpen || !planService.serviceClose) { return; }

      $scope.howLongOptions = [{
          minutes: 0,
          name: 'No return trip'
        }];

      time = $scope.fromMoment.clone();
      endOfDay = planService.serviceClose.clone()
      beginOfDay = planService.serviceOpen.clone()

      if(time.isBefore(beginOfDay)) {
        startingTime = beginOfDay;
        time = beginOfDay.clone()
      } else {
        startingTime = time.clone()
      }

      time.add(60, 'm')
      while (time.isBefore(endOfDay) || time.isSame(endOfDay)) {
        name = [];
        minDiff = time.diff(startingTime, 'minutes');
        hrsDiff = time.diff(startingTime, 'hours');

        if (hrsDiff > 0) { name.push(hrsDiff, (hrsDiff === 1 ? 'Hour' : 'Hours')) }
        if (minDiff % 60 > 0) { name.push(minDiff % 60, (minDiff % 60 === 1 ? 'Minute' : 'Minutes')) }
        
        $scope.howLongOptions.push({
          minutes: minDiff,
          name: name.join(' ')
        });

        if($scope.howLong && minDiff == $scope.howLong.minutes){
          selectedIndex = $scope.howLongOptions.length-1;
        }

        time.add(15, 'm');
      }

      selectedIndex = selectedIndex || 0;
      $scope.howLong = $scope.howLongOptions[ selectedIndex ];
      $scope.updateReturnTime($scope.howLong);
    }

    $scope.toggleShowBusRides = function(){
      $scope.showBusRides =! $scope.showBusRides;
      planService.showBusRides = $scope.showBusRides;
    }

    //initialize this step's state
    if ($scope.loggedIn) {
      planService.getCurrentBalance($scope, $http, ipCookie).then(function(){
        // Service sets ipCookie with currentBalance
      });
    }

    switch($routeParams.step) {

      case undefined:
        break;
      case 'transit':
        (function(){
          var startDate, endDate, end;
          var startDate = moment(new Date(planService.transitItineraries[0][ $scope.selectedBusOption[0] ].start_time));
          end = planService.transitItineraries[1] || planService.transitItineraries[0];
          var endDate = moment(new Date(end[$scope.selectedBusOption[1]].end_time));
          $scope.startDay = startDate.format('dddd');
          $scope.startDate = startDate.format('MMMM Do');
          $scope.startTime = startDate.format('h:mm a');
          $scope.endTime = endDate.format('h:mm a');
          $scope.transitInfos = planService.transitInfos;
          $scope.transit = "transit";
          $scope.mode = "transit";
        }());
      break;
      case 'walk':
        (function(){
          var startDate, endDate, end;
          var startDate = moment(new Date(planService.walkItineraries[0].start_time));
          end = planService.walkItineraries[1] || planService.walkItineraries[0];
          var endDate = moment(new Date(end.end_time));
          $scope.startDay = startDate.format('dddd');
          $scope.startDate = startDate.format('MMMM Do');
          $scope.startTime = startDate.format('h:mm a');
          $scope.endTime = endDate.format('h:mm a');
          $scope.walkItineraries = planService.walkItineraries;
          $scope.mode = "walk";
        }());
      break;
      case 'where':
        //load the map origin/destination
        if($scope.to){
          $scope.selectPlace($scope.to, 'to', true);
        }else if($scope.toDefault){
          $scope.selectPlace($scope.toDefault, 'to', true);
        }
        if($scope.from){
          $scope.selectPlace($scope.from, 'from', true);
        }else if($scope.fromDefault){
          $scope.selectPlace($scope.fromDefault, 'from', true);
        }
        break;
      case 'purpose':
        planService.getTripPurposes($scope, $http).then(function(){
          // pull trip purposes from planService after fetching them and then expose them for the front end to use
          $scope.purposes = planService.purposes
          $scope.top_purposes = planService.top_purposes
          usSpinnerService.stop('spinner-1');
          if ($scope.purposes.length + $scope.top_purposes.length <= 0) {
            $location.path('/plan/no_purposes/error');
          }
        });
        $scope.showNext = false;
        break;
      case 'when':
        $scope.showNext = false;
        $scope.whenShowNext = function(){
          //true to show next
          var fromOK, returnOK,

          _checkServiceHours = function(from, open, close, okNull) {
            var startMoment, endMoment;
      
            if(from === null){
              if( okNull === true ){ return true; }
              return false; // if the day is null return false (unless null is ok)
            }
            if( !(open && close) ){ return false; } //return false if selected day does not have service hours

            //return false if time not within the service hours
            startMoment = open.clone().subtract(1, 'seconds');
            endMoment = close.clone().add(1, 'seconds');
            if( !from.isBetween(startMoment, endMoment) ){ return false; } // help

            //make sure day is in the future
            if( moment().isAfter(from) ){ return false; } // help

            //passed all checks, ok to show next
            return true;
          };// end _checkServiceHours
          fromOK = _checkServiceHours( $scope.fromMoment, planService.serviceOpen, planService.serviceClose );
          returnOK = _checkServiceHours( $scope.returnMoment, planService.serviceOpen, planService.serviceClose, true);
          return fromOK && returnOK && $scope.fromTimeUpdated;
        }

        $scope.$watch('fromMoment', function (n) {
          $scope.showNext = false;
          if( !n || !n._isAMomentObject ){ return;}
          $scope.showNext = $scope.whenShowNext();
          _setupHowLongOptions();
          planService.fromDate = n.toDate();
          planService.fromTime = n.toDate();
          planService.fromTimeType = 'arrive';
          planService.returnTimeType =  'depart';
          planService.asap = false;
        });
        break;
      case 'confirm' :
        $scope.transitResult = planService.transitResult;
        $scope.paratransitResult = planService.paratransitResult;

        planService.prepareTripSearchResultsPage();
        $scope.fare_info = planService.fare_info;
        $scope.paratransitItineraries = planService.paratransitItineraries;

        // TODO (Drew Teter, 09/22/2022) Fully Remove ability for guest login.
        // We plan on doing this in the future, but as no tickets have been created yet
        // I'm just commenting out these lines for now.

        // if(planService.guestParatransitItinerary){
        //   //don't let there be paratransit itineraries if the guest itinerary is populated
        //   $scope.paratransitItineraries = [];
        // }

        if (!planService.paratransitResult) {
          // Don't let there be paratransit itineraries if the purpose is not eligible.
          $scope.paratransitItineraries = [];
        }

        // TODO (Drew Teter, 09/22/2022) Fully Remove ability for guest login.
        // We plan on doing this in the future, but as no tickets have been created
        // for this task yet, I'm just commenting out this line for now.

        // $scope.guestParatransitItinerary = planService.guestParatransitItinerary;

        $scope.walkItineraries = planService.walkItineraries;
        $scope.transitItineraries = planService.transitItineraries;
        $scope.transitInfos = planService.transitInfos;
        $scope.taxiItineraries = planService.taxiItineraries;
        $scope.hasTaxi = $scope.taxiItineraries.length > 0;
        $scope.uberItineraries = planService.uberItineraries;
        $scope.hasUber = $scope.uberItineraries.length > 0;
        $scope.noresults = false;
        $scope.request = planService.confirmRequest;
        $scope.showBusRides = planService.showBusRides;
        $scope.hasParatransit = $scope.paratransitItineraries.length > 0;
        $scope.hasTransit = $scope.transitInfos.length > 0;
        $scope.hasWalk = $scope.walkItineraries.length > 0;

        const firstItinerary = $scope.transitItineraries && $scope.transitItineraries[0] && $scope.transitItineraries[0][0];
        const firstTransit = firstItinerary && firstItinerary.json_legs.find(leg => leg.mode === 'BUS');
        $scope.transitRoute = firstTransit ? firstTransit.route : undefined;
        // If itinerary results is 0, return no results
        if($scope.paratransitItineraries.length < 1 && $scope.transitItineraries.length < 1 && $scope.walkItineraries.length < 1 && !$scope.hasUber && !$scope.hasTaxi){
          $scope.noresults = true;
        }

        // Check if Transit Itineraries exist before finding the name of the transit route
        if ($scope.transitItineraries && $scope.transitItineraries.length > 0) {
          const firstItinerary = $scope.transitItineraries[0][0]
          const firstTransit = firstItinerary.json_legs.find(leg => leg.mode === 'BUS') // check to see what happens if leg.mode doesn't exist
          $scope.transitRoute = firstTransit ? firstTransit.route : undefined
        }

        $scope.$watch('selectedBusOption', function(n){
          if(n && n.length && typeof n === 'object'){
            planService.selectedBusOption = n;
          }
        })
        break;
      case 'transit_details' :
        $scope.transitItineraries = planService.transitItineraries;
        $scope.transitInfos = planService.transitInfos;
        $scope.request = planService.confirmRequest;
        $scope.$watch('selectedBusOption', function(n){
          if(n && n.length && typeof n === 'object'){
            planService.selectedBusOption = n;
          }
        })
        break;
      case 'returnTimeType':
        var fromDate = planService.fromDate;
        var returnDate = planService.returnDate;
        if(planService.returnTime && planService.returnTimeType){
          $scope.returnTime = planService.returnTime;
          $scope.returnTimeType = planService.returnTimeType;
        }else{
          if(moment(fromDate).format('M/D/YYYY') == moment(returnDate).format('M/D/YYYY')) {
            var fromTimeType = planService.fromTimeType;
            var fromTime = planService.fromTime
            if(planService.asap == true){
              $scope.returnTime = new Date(fromTime);
              $scope.returnTime.setHours($scope.returnTime.getHours() + 2);
            } else if(fromTimeType == 'depart'){
              $scope.returnTime = new Date(fromTime);
              $scope.returnTime.setHours($scope.returnTime.getHours() + 4);
            } else if(fromTimeType == 'arrive'){
              $scope.returnTime = new Date(fromTime);
              $scope.returnTime.setHours($scope.returnTime.getHours() + 2);
            }
          }else{
            var now = moment().startOf('day');
            now.add(10, 'hours');
            $scope.returnTime = now.toDate();
          }
          //now round up to 15 min interval
          var start = moment($scope.returnTime);
          var remainder = (start.minute()) % 15;
          if(remainder != 0){
            remainder = Math.abs(remainder - 15);
            $scope.returnTime.setMinutes($scope.returnTime.getMinutes() + remainder);
          }
          $scope.disableNext = false;
          $scope.returnTimeType = 'depart';
        }
        $scope.showNext = true;
        break;
      case 'from_confirm':
        if(planService.from == null){
          $location.path("/plan/fromDate");
          $scope.step = 'fromDate';
        }
        $scope.showNext = false;
        break;
      case 'list_itineraries':
        if($routeParams.test){
          $http.get('//' + APIHOST + '/data/bookingresult.json').
            success(function(data) {
              planService.itineraryRequestObject = data.itinerary_request;
              planService.searchResults = data.itinerary_response;
              planService.booking_request = data.booking_request;
              planService.booking_results = data.booking_response.booking_results;
              planService.prepareTripSearchResultsPage();
              $scope.fare_info = planService.fare_info;
              $scope.paratransitItineraries = planService.paratransitItineraries;
              $scope.walkItineraries = planService.walkItineraries;
              $scope.transitItineraries = planService.transitItineraries;
              $scope.transitInfos = planService.transitInfos;
              $scope.noresults = false;
              if($scope.paratransitItineraries.length < 1 && $scope.transitItineraries.length < 1 && $scope.walkItineraries.length < 1){
                $scope.noresults = true;
              }else if($scope.paratransitItineraries.length < 1 && $scope.transitItineraries.length < 1 && $scope.walkItineraries.length > 0){
                $scope.step = 'alternative_options';
              }else if($scope.walkItineraries.length > 0){
                $scope.showAlternativeOption = true;
              }
            });
        }else{
          planService.prepareTripSearchResultsPage();
          $scope.fare_info = planService.fare_info;
          $scope.paratransitItineraries = planService.paratransitItineraries;
          $scope.walkItineraries = planService.walkItineraries;
          $scope.transitItineraries = planService.transitItineraries;
          $scope.transitInfos = planService.transitInfos;
          $scope.noresults = false;
          if($scope.paratransitItineraries.length < 1 && $scope.transitItineraries.length < 1 && $scope.walkItineraries.length < 1){
            $scope.noresults = true;
          }else if($scope.paratransitItineraries.length < 1 && $scope.transitItineraries.length < 1 && $scope.walkItineraries.length > 0){
            $scope.step = 'alternative_options';
          }else if($scope.walkItineraries.length > 0){
            $scope.showAlternativeOption = true;
          }
        }
        $scope.showNext = false;
        break;
      // case 'discounts':
      //   var basefareIndex = null;
      //   angular.forEach(planService.paratransitItineraries[0].discounts, function(discount, index) {
      //     if(discount.base_fare && discount.base_fare == true){
      //       basefareIndex = index;
      //     }
      //     discount.fare = new Number(discount.fare).toFixed(2);
      //   });
      //   if(basefareIndex){
      //     var basefare = planService.paratransitItineraries[0].discounts[basefareIndex];
      //     planService.paratransitItineraries[0].discounts.splice(basefareIndex, 1);
      //     planService.paratransitItineraries[0].discounts.unshift(basefare);
      //   }
      //   $scope.paratransitItinerary = planService.paratransitItineraries[0];
      //   $scope.showNext = false;
      //   break;
      case 'my_rides':
        planService.reset();
        planService.getPastRides($http).then(function(data) {
          planService.populateScopeWithTripsData($scope, planService.unpackTrips(data.data.trips, 'past'), 'past');
        });
        planService.getFutureRides($http).then(function(data) {
          var liveTrip = planService.processFutureAndLiveTrips(data, $scope, ipCookie);
          if (liveTrip) { // If there's a live trip, check for realtime updates
            planService.createEtaChecker($scope, $http, ipCookie);
          }

          var navbar = $routeParams.navbar;
          if(navbar){
            $scope.tabFuture = true;
            delete $scope.tabPast;
          }

        });

        $scope.hideButtonBar = true;
        $window.visited = true;

        break;
      // case 'companions':
      //   $scope.showNext = false;
      //   break;
      case 'assistant':
        $scope.questions = planService.getPrebookingQuestions();
        $scope.hasEscort = planService.hasEscort;
        $scope.numberOfCompanions = planService.numberOfCompanions;

        if ($scope.numberOfCompanions === null || $scope.numberOfCompanions === undefined) {
          $scope.numberOfCompanions = 0;
        }

        $scope.hasCompanions = $scope.numberOfCompanions > 0
        break;
      case 'instructions_for_driver':
        $scope.driverInstructions = planService.driverInstructions;
        break;
      case 'rebook':
        $scope.minDate = new Date();
        $scope.trip = planService.rebookTrip;
        if(planService.rebookTrip.itineraries.length > 1){
          $scope.roundTrip = true;
        }

        $scope.fromTime = moment($scope.trip.itineraries[0].requested_time).toDate();
        $scope.fromTimeType = $scope.trip.itineraries[0].requested_time_type;

        if($scope.fromTime.getTime() > new Date().getTime()){
          $scope.fromDate = moment($scope.fromTime).add(1, 'week').toDate();
        }else{
          $scope.fromDate = moment().add(1, 'week').toDate();
        }

        if($scope.trip.itineraries.length > 1){
          $scope.minReturnDate = $scope.fromDate;
          $scope.returnTime = moment($scope.trip.itineraries[1].requested_time).toDate();
          $scope.returnTimeType = $scope.trip.itineraries[1].requested_time_type;
          var datediff = Math.abs(moment($scope.trip.itineraries[0].end_time).diff(moment($scope.trip.itineraries[1].start_time), 'days'));
          $scope.returnDate = moment($scope.fromDate).add(datediff, 'day').toDate();
        }
        $scope.hideButtonBar = true;
        break;
      default:

        break;
    }

    $scope.$watch('fromTime', function(n) {
        if($scope.step == 'fromTimeType'){
          var fromDate = planService.fromDate;
          var now = moment(returnDate).startOf('day'); ;
          var dayDiff = now.diff(fromDate, 'days');
          if(Math.abs(dayDiff) < 1){
            var timeDiff = moment().diff(n, 'seconds');
            if(timeDiff > 0){
              $scope.showNext = false;
              $scope.message = 'Please enter a departure time after the current time.'
            }else{
              $scope.showNext = true;
              $scope.message = null;
            }
          }
        }
      }
    );

    $scope.$watch('returnTime', function(n) {
        if($scope.step == 'returnTimeType'){
          if (n) {

            var fromDate = planService.fromDate;
            var fromTime = planService.fromTime;
            if(fromTime == null){
              fromTime = new Date();
            }
            fromTime.setYear(fromDate.getFullYear());
            fromTime.setMonth(fromDate.getMonth());
            fromTime.setDate(fromDate.getDate());
            var returnTime = $scope.returnTime;
            var returnDate = planService.returnDate;

            var now = moment(returnDate).startOf('day'); ;
            var dayDiff = now.diff(fromDate, 'days');
            if(Math.abs(dayDiff) < 1){
              //departing and returning on the same day, is the return time after departure?
              returnTime.setYear(returnDate.getFullYear());
              returnTime.setMonth(returnDate.getMonth());
              returnTime.setDate(returnDate.getDate());
              var timeDiff = moment(returnTime).diff(fromTime, 'minutes');
              if(timeDiff > 10){
                $scope.showNext = true;
                $scope.message = null;
              } else {
                $scope.showNext = false;
                $scope.message = 'Please enter a return time at least 10 minutes after the departure time.'
              }
            }
          }else{
            $scope.disableNext = true;  //not a valid time
          }
        }
      }
    );

    $scope.$watch('confirmFromLocationMap', function(n) {
        if (n) {
          if(planService.fromDetails && $scope.step == 'from_confirm'){
            var result = planService.fromDetails;
            delete result.geometry.location.lat;
            delete result.geometry.location.lng;
            n.setCenter(result.geometry.location);
            if($scope.marker){
              $scope.marker.setMap(null);
            }
            $scope.marker = new google.maps.Marker({
              map: n,
              position: result.geometry.location,
              animation: google.maps.Animation.DROP
            });

            google.maps.event.trigger(n, 'resize');
            n.setCenter(result.geometry.location);
            $scope.showMap = true;
            $scope.showConfirmLocationMap = true;
          }
        }
      }
    );

    $scope.$on("$destroy", function () {
      planService.killEtaChecker();
    });

  }
]);

;
'use strict';

angular.module('applyMyRideApp')
  .controller('LoginController', ['$scope', '$rootScope', '$location', 'flash', 'planService', '$http', 'ipCookie', '$window', 'localStorageService', 'util', 'Idle',
    function ($scope, $rootScope, $location, flash, planService, $http, ipCookie, $window, localStorageService, util, Idle) {
      //skip initializing this controller if we're not on the page
      if( ['/','/loginError'].indexOf( $location.path() ) == -1){ return; }

      util.getCounties(
        function(response) {
          var counties = response.data.service_ids;
          $scope.counties = counties;
          localStorageService.set("counties", counties);
        }
      );

      util.getCountiesInTransition(
        function (response) {
          $scope.transitionCounties = response.counties;
        }
      );

      util.getTransitionMessages(
        function (response) {
          $scope.countyInTransitionMessage = response.countyInTransitionMessage;
          $scope.transitionHelpMessage = response.helpMessage;
        }
      );

      $scope.location = $location.path();
      $scope.rememberme = true;
      $scope.disableNext = true;
      $scope.counties = localStorageService.get("counties") || [];
      $scope.sharedRideId = localStorageService.get("customer_number") || ipCookie('sharedRideId');
      $scope.county = localStorageService.get("county") || ipCookie('county');
      $scope.dateofbirth = sessionStorage.getItem('dateofbirth') || false;
      $scope.dob = localStorageService.get("dob") || {month:'', day:'', year:''};
      if($scope.dateofbirth){
        var dob = moment($scope.dateofbirth);
        $scope.dob = $scope.dob || {month:dob.month()+1, day:dob.date(), year:dob.year()};
      }
      $scope.errors = {dob:false};

      var authentication_token = ipCookie('authentication_token');
      var email = ipCookie('email');
      $window.visited = true;

      if(authentication_token && email){
        planService.authentication_token = authentication_token;
        planService.email = email;
        $location.path('/plan/where');
      }else{
        delete localStorage.last_origin;
        delete localStorage.last_destination;
      }

      function checkNextValid(){
        var bd;
        try{
          bd = moment()
          bd.month( parseInt($scope.dob.month)-1 )
          bd.date($scope.dob.day)
          bd.year($scope.dob.year);
        }catch(e){
          $scope.dateofbirth = false;
        }
        $scope.errors.dob = (( $scope.loginform.month.$dirty && $scope.loginform.month.$invalid )
                            || ($scope.loginform.day.$dirty && $scope.loginform.day.$invalid )
                            || (($scope.loginform.year.$viewValue||'').length > 3 && $scope.loginform.year.$invalid ));
        if( !$scope.errors.dob && $scope.dob.month && $scope.dob.day && $scope.dob.year ){
          $scope.dateofbirth = bd.toDate();
        }else{
          $scope.dateofbirth = false;
        }
        $scope.disableNext = !($scope.loginform.month.$valid
                          && $scope.loginform.day.$valid
                          && $scope.loginform.year.$valid
                          && $scope.dateofbirth
                          && $scope.sharedRideId
                          && $scope.county
                          && true);
      }

      $scope.isTransitionCounty = function (county) {
        return $scope.transitionCounties &&
          $scope.transitionCounties.includes($scope.county);
      }

      $scope.checkId = function() {
        $scope.disableNext = true;
        var path = $location.path();
        if(path == '/' || path == '/loginError' ){
          if($scope.sharedRideId && $scope.county && $scope.dateofbirth){
            var sharedRideId = $scope.sharedRideId;
            if(sharedRideId.toString().length > 0){
              $scope.disableNext = false;
            }
          }
        }
      };

      $scope.next = function(){
        if($scope.disableNext)
          return;
        var path = $location.path();
        planService.sharedRideId = $scope.sharedRideId;
        planService.county = $scope.county;
        planService.dateofbirth = $scope.dateofbirth;
        $scope.authenticate();
        $scope.disableNext=true;
      }

      $scope.back = function(){
        $location.path('/');
      }

      $scope.$watch('dob.month', function(n){
          var monthInt = parseInt(n);
          if(monthInt > 1 && monthInt < 13){
              $('#LoginTemplate input.dob.day').focus();
          }
          checkNextValid();
          return;
      });
      $scope.$watch('dob.day', function(n){
          var dayInt = parseInt(n);
          if(dayInt > 3){
              $('#LoginTemplate input.dob.year').focus();
          }
          checkNextValid();
          return;
      });
      $scope.$watch('dob.year', function(n){
          checkNextValid();
          return;
      });
      $scope.$watch('sharedRideId', function(n) {
        $('#LoginTemplate input.shared-ride-id').focus();
        return;
      });

      $rootScope.$on('IdleTimeout', function() {
        // The user has timed out (meaning idleDuration + timeout has passed without any activity)
        // Log the user out.
        $rootScope.$emit("CallLogout", {});
      });

      $scope.authenticate = function(){
        planService.dateofbirth = $scope.dateofbirth;
        var login = {};
        login.session = {};
        login.session.ecolane_id = planService.sharedRideId.toString();
        login.session.county = planService.county;
        login.session.dob = moment($scope.dateofbirth).format('M/D/YYYY');

        ipCookie('sharedRideId', login.session.ecolane_id, {expires: 7, expirationUnit: 'days'});
        ipCookie('county', login.session.county, {expires: 7, expirationUnit: 'days'});
        sessionStorage.setItem('dateofbirth', login.session.dob);

        var promise = $http.post('//'+APIHOST+'/api/v1/sign_in', login);
        promise.error(function(result) {
          $location.path('/loginError');
        });
        promise.then(function(result) {
          planService.authentication_token = result.data.authentication_token;
          planService.email = result.data.email;
          planService.first_name = result.data.first_name;
          planService.last_name = result.data.last_name;
          planService.getPastRides($http).then(function(data) {
            planService.populateScopeWithTripsData($scope, planService.unpackTrips(data.data.trips, 'past'), 'past');
          });
          planService.getFutureRides($http).then(function(data) {
            var liveTrip = planService.processFutureAndLiveTrips(data, $scope, ipCookie);

            if(liveTrip) {
              $location.path('/itinerary'); // If it exists, go to itinerary page
            }

          });
          var lastDest, lastOrigin;
          if(result.data.last_destination && typeof '' !== typeof result.data.last_destination && result.data.last_destination.formatted_address){
            lastDest = result.data.last_destination.formatted_address;
          }else{
            lastDest = result.data.last_destination || '';
          }
          if(result.data.last_origin && typeof '' !== typeof result.data.last_origin && result.data.last_origin.formatted_address){
            lastOrigin = result.data.last_origin.formatted_address;
          }else{
            lastOrigin = result.data.last_origin || '';
          }
          localStorage.setItem('last_destination', lastDest);
          localStorage.setItem('last_origin', lastOrigin);
          if($scope.rememberme == true){
            ipCookie('email', planService.email, {expires: 7, expirationUnit: 'days'});
            ipCookie('authentication_token', planService.authentication_token, {expires: 7, expirationUnit: 'days'});
            ipCookie('first_name', planService.first_name, {expires: 7, expirationUnit: 'days'});
            ipCookie('last_name', planService.last_name, {expires: 7, expirationUnit: 'days'});
          }else{
            ipCookie.remove('email');
            ipCookie.remove('authentication_token');
            ipCookie.remove('first_name');
            ipCookie.remove('last_name');
            ipCookie.remove('sharedRideId');
            ipCookie.remove('county');
            sessionStorage.setItem('dateofbirth', null);
          }
          planService.getProfile($http).then(function(result) {
            planService.profile = result.data;
            if($location.path() === "/itinerary") { return; } // Don't redirect if already redirecting to Itinerary.
            if(planService.to && planService.from && planService.fromDate){
                $location.path('/plan/purpose');
            }else{
                $location.path('/plan/where');
            }
          });
          Idle.watch();
        });
      }
    }
  ])
  .config(function(IdleProvider, KeepaliveProvider) {
    // configure Idle settings
    IdleProvider.idle(1); // in seconds
    IdleProvider.timeout(60 * 60); // in seconds
  })
  .run(function(Idle){
    // start watching when the app runs. also starts the Keepalive service by default.
    Idle.watch();
  });

;
'use strict';

angular.module('applyMyRideApp')
  .controller('LookupIdController', ['$scope', '$location', '$http', 'localStorageService', 'ipCookie', 'util',
    function ($scope, $location, $http, localStorageService, ipCookie, util) {
      //skip initializing this controller if we're not on the page
      if( ['/lookupIdForm', '/lookupError'].indexOf( $location.path() ) == -1){ return; }

      util.getCountiesInTransition(
        function (response) {
          $scope.transitionCounties = response.counties;
        }
      );

      util.getTransitionMessages(
        function (response) {
          $scope.countyInTransitionMessage = response.countyInTransitionMessage;
          $scope.transitionHelpMessage = response.helpMessage;
        }
      );
      $scope.isTransitionCounty = function (county) {
        return $scope.transitionCounties &&
          $scope.transitionCounties.includes($scope.county);
      }

      $scope.location = $location.path();
      $scope.counties = localStorageService.get("counties") || util.getCounties(function(r) {
        $scope.counties = r.data.service_ids;
      });
      $scope.county = localStorageService.get("county") || ipCookie('county');
      $scope.lastName = localStorageService.get("lastName") || null;
      $scope.errors = {dob:false};
      $scope.dob = localStorageService.get("dob") || {month:'', day:'', year:''};

      // Look Up User Ecolane ID
      $scope.lookupId = function() {
        localStorageService.set("county", $scope.county);
        localStorageService.set("lastName", $scope.lastName);
        localStorageService.set("dob", $scope.dob);

        var promise = $http.get('//' + APIHOST +
          '/api/v1/users/lookup?booking_agency=ecolane&last_name=' + $scope.lastName +
          '&date_of_birth=' + $scope.dob.year + '-' + $scope.dob.month + '-' + $scope.dob.day +
          '&county=' + $scope.county);
        promise.error(function(result) {
          $location.path('/lookupError');
        });
        promise.then(function(result) {
          localStorageService.set("customer_number", result.data.customer_number);  // ...populate Shared Ride ID field with ID
          $location.path('/'); // On success, toggle back to login form, and...
        });
      };

      // date of birth picker validity checker
      function checkNextValid(){
        // console.log("Month changed", $scope, $scope.lookupidform);
        var bd;
        try{
          bd = moment()
          bd.month( parseInt($scope.dob.month)-1 )
          bd.date($scope.dob.day)
          bd.year($scope.dob.year);
        }catch(e){
          $scope.dateofbirth = false;
        }
        $scope.errors.dob = (( $scope.lookupidform.month.$dirty && $scope.lookupidform.month.$invalid )
                            || ($scope.lookupidform.day.$dirty && $scope.lookupidform.day.$invalid )
                            || (($scope.lookupidform.year.$viewValue||'').length > 3 && $scope.lookupidform.year.$invalid ));
        if( !$scope.errors.dob && $scope.dob.month && $scope.dob.day && $scope.dob.year ){
          $scope.dateofbirth = bd.toDate();
        }else{
          $scope.dateofbirth = false;
        }
        $scope.disableNext = !($scope.lookupidform.month.$valid
                          && $scope.lookupidform.day.$valid
                          && $scope.lookupidform.year.$valid
                          && $scope.dateofbirth
                          && $scope.sharedRideId
                          && $scope.county
                          && true);
      }

      // date of birth watchers
      $scope.$watch('dob.month', function(n, o){
          if(n == o) { return; }
          var monthInt = parseInt(n);
          if(monthInt > 1 && monthInt < 13){
              $('#LookupIdTemplate input.dob.day').focus();
          }
          checkNextValid();
          return;
      });
      $scope.$watch('dob.day', function(n, o){
          if(n == o) { return; }
          var dayInt = parseInt(n);
          if(dayInt > 3){
              $('#LookupIdTemplate input.dob.year').focus();
          }
          checkNextValid();
          return;
      });
      $scope.$watch('dob.year', function(n, o){
          if(n == o) { return; }
          checkNextValid();
          return;
      });

    }
  ]);

;
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
            $scope.message = 'Outbound Transit & Walk Options';
          } else {
            $scope.message = 'Return Transit & Walk Options';
          }
        }else{
          $scope.message = 'Transit & Walk Options';
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
        const index = $(event.target).parents('.accordion').attr('index');
        $scope.showDiv[index] = !$scope.showDiv[index];
      }

    }
  ]);

;
'use strict';

angular.module('applyMyRideApp')
  .controller('ParatransitController', ['$scope','$routeParams', '$location', 'flash', 'planService', '$http', 'ipCookie',
    function ($scope, $routeParams, $location, flash, planService, $http, ipCookie) {

      $scope.location = $location.path();
      $scope.disableNext = true;
      $scope.tripid = $routeParams.tripid;
      $scope.showDiv = {};
      $scope.loggedIn = !!planService.email;

      $scope.reset = function() {
        planService.reset();
        $location.path("/plan/where");
      };

      $scope.prepareTrip = function(){

        angular.forEach(planService.paratransitItineraries, function(result, index) {
          planService.setItineraryDescriptions(result);
        });
        
        angular.forEach(planService.booking_results, function(result, index) {
          result.wait_startDesc = moment.parseZone(result.wait_start).format('h:mm a');
          result.wait_endDesc = moment.parseZone(result.wait_end).format('h:mm a');
          // don't assume wait window is 30 minutes, get diff
          var d1 = new Date(result.wait_end);
          var d2 = new Date(result.wait_start);

          result.arrivalDesc = moment.parseZone(result.arrival).format('h:mm a');
          if (result.negotiated_duration)
            result.travelTime = humanizeDuration(result.negotiated_duration * 1000,  { units: ["hours", "minutes"], round: true });
          else {
            var itinDuration = null;
            var itin_id = result.itinerary_id;
            angular.forEach(planService.paratransitItineraries, function (itinerary, index) {
              if (itinerary.id === itin_id)
                itinDuration = itinerary.duration;
            });
            result.travelTime = humanizeDuration(itinDuration * 1000, { units: ["hours", "minutes"], round: true });
            var arrival = new Date(d1.getTime() + ((d2 - d1) / 2) + (itinDuration * 1000));
            result.arrivalDesc = moment(arrival.toLocaleString("en-US", {timeZone: "US/Eastern"})).format('h:mm a');
          }
          if(!result.booked  == true){
            $scope.booking_failed = true;
          }
        });

        $scope.purpose = planService.itineraryRequestObject.trip_purpose;

        $scope.tripCancelled = !planService.booking_results[0].booked;

        if(!$scope.booking_failed){
          ipCookie('rideCount', ipCookie('rideCount') + 1);
          $scope.rideCount = ipCookie('rideCount');
        }

        $scope.booking_results = planService.booking_results;
        $scope.paratransitItineraries = planService.paratransitItineraries;
        $scope.driverInstructions = planService.driverInstructions;
        if ($scope.driverInstructions == null) {
          $scope.driverInstructions = 'N/A';
        }

        $scope.escort = "";
        
        if (planService.hasEscort == true) {
          $scope.escort += "1 Escort";
        }

        if (planService.numberOfCompanions != null && planService.numberOfCompanions > 0) {
          if ($scope.escort) {
            $scope.escort += ', ';
          }
          $scope.escort += planService.numberOfCompanions + ' Companion';
          if (planService.numberOfCompanions > 1) {
            $scope.escort += 's';
          }
        }

        if ($scope.escort.length == 0) {
          $scope.escort = 'N/A';
        }

      }

      $scope.cancelTrip = function(){
        var message = "Are you sure you want to cancel this ride?";
        var successMessage = 'Your trip has been cancelled.'

        $scope.paratransitItineraries = planService.paratransitItineraries;

        if($scope.paratransitItineraries.length > 1 &&  !$scope.outboundCancelled &&  !$scope.returnCancelled){
          
          // DEAL WITH Round Trips
          bootbox.prompt({
              title: message,
              message: '<p>Please select an option below:</p>',
              inputType: 'radio',
              inputOptions: [
              {
                  text: 'Cancel Entire Trip',
                  value: 'BOTH',
              },
              {
                  text: 'Cancel Outbound Trip Only',
                  value: 'OUTBOUND',
              },
              {
                  text: 'Cancel Return Trip Only',
                  value: 'RETURN',
              }
              ],
              buttons: {
                  'cancel': {
                    label: 'Keep Ride'
                  },
                  'confirm': {
                    label: 'Cancel Ride'
                  }
              },
              callback: function(result){
                $scope.cancelCall(result);
              }
          });
        }else{

        // DEAL WITH 1 Way Trips
        bootbox.confirm({
          message: message,
          buttons: {
            'cancel': {
              label: 'Keep Ride'
            },
            'confirm': {
              label: 'Cancel Ride'
            }
          },
          callback: function(result){
            if(result){
              if($scope.outboundCancelled){
                 $scope.cancelCall('RETURN')
              } else if($scope.returnCancelled){
                 $scope.cancelCall('OUTBOUND')
              } else {
                $scope.cancelCall('BOTH')
              }
            }
          }
        })
      }
      }

      $scope.cancelCall = function(result){
        if(result != 'BOTH' && result != 'OUTBOUND' && result != 'RETURN'){
          return;
        }

        var itinsToCancel; 
        var successMessage;
        if(result == 'BOTH'){
          itinsToCancel = $scope.paratransitItineraries
          successMessage = 'Your trip has been cancelled.';
        }
        else if(result == 'OUTBOUND'){
          itinsToCancel = [$scope.paratransitItineraries[0]];
          successMessage = 'Your outbound trip has been cancelled.';
        } else if(result == 'RETURN'){
          itinsToCancel = [$scope.paratransitItineraries[$scope.paratransitItineraries.length - 1]];
          successMessage = 'Your return trip has been cancelled.';
        }
        
        var cancel = {};

        cancel.bookingcancellation_request = [];
        
        angular.forEach(itinsToCancel, function(itinerary, index) {
          var bookingCancellation = {};
          if(itinerary.id){
            bookingCancellation.itinerary_id = itinerary.id;
          } else if(itinerary.booking_confirmation){
            bookingCancellation.booking_confirmation = itinerary.booking_confirmation;     
          }
          cancel.bookingcancellation_request.push(bookingCancellation);
        });


        
        var cancelPromise = planService.cancelTrip($http, cancel)
        cancelPromise.error(function(data) {
          bootbox.alert("An error occurred, your trip was not cancelled.  Please call 1-844-PA4-RIDE for more information.");
        });
        
        cancelPromise.success(function(data) {
          bootbox.alert(successMessage);
          if(result == 'BOTH'){
            $scope.tripCancelled = true;
            ipCookie('rideCount', ipCookie('rideCount') - 1);
          }
          else if(result == 'OUTBOUND'){
            $scope.outboundCancelled = true;
            if($scope.returnCancelled){
              ipCookie('rideCount', ipCookie('rideCount') - 1);
            }
          }else if(result == 'RETURN'){
            $scope.returnCancelled = true;
            if($scope.outboundCancelled){
              ipCookie('rideCount', ipCookie('rideCount') - 1);
            }
          }
        })
      }
      $scope.bookSharedRide = function(){
        var promise = planService.bookSharedRide($http);
        promise.then(function(result) {
          planService.booking_results = result.data.booking_results;
          $scope.tripCancelled = false;
          return;
          $location.path('/paratransit/confirm_shared_ride');
        });
        return false;
      }

      $scope.toggleEmail = function($event) {
        $scope.invalidEmail = false;
        $scope.showEmail = !$scope.showEmail;
        $event.stopPropagation();
      };

      $scope.sendEmail = function($event) {
        
        $event.stopPropagation();
        var bookingResults = $scope.booking_results;
        var emailString = $scope.emailString;

        if(emailString && bookingResults.length > 0){
          var result = planService.validateEmail(emailString);
          if(result == true){

            $scope.showEmail = false;

            var emailRequest = {};
            emailRequest.email_address = emailString;

            angular.forEach(bookingResults, function(result, index) {
              if(result.booked == true){
                if(index == 0){
                  emailRequest.booking_confirmations = [];
                }
                emailRequest.booking_confirmations.push(result.confirmation_id);            
              }
            });

            var emailPromise = planService.emailItineraries($http, emailRequest);
            emailPromise.error(function(data) {
              bootbox.alert("An error occurred on the server, your email was not sent.");
            });
            bootbox.alert('Your email was sent');
          }else{
            $scope.invalidEmail = true;
          } 
        }
      }

      $scope.prepareTrip();

    }


  ]);

;
'use strict';

angular.module('applyMyRideApp')
  .controller('WalkController', ['$scope','$routeParams', '$location', 'flash', 'planService', '$http',
    function ($scope, $routeParams, $location, flash, planService, $http) {

        $scope.location = $location.path();
        $scope.disableNext = true;

      $scope.loggedIn = !!planService.email;
      $scope.showEmail = false;

      $scope.reset = function() {
        planService.reset();
        $location.path("/plan/where");
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
        $scope.walkItineraries = planService.walkItineraries;
        $scope.purpose = planService.itineraryRequestObject.trip_purpose;
      }

      $scope.selectWalkingTrip = function(){
        $scope.walkItineraries = planService.walkItineraries;
        var selectedItineraries = [];
        var tripId = planService.tripId;
        angular.forEach(planService.walkItineraries, function(itinerary, index) {
          selectedItineraries.push({"trip_id":tripId, "itinerary_id":itinerary.id});
        });

        var selectedItineraries = {"select_itineraries": selectedItineraries};
        var promise = planService.selectItineraries($http, selectedItineraries);
        promise.then(function(result) {
          $scope.selected = true;
        });
      }

      $scope.prepareTrip();

    }
  ]);

;
'use strict';

angular.module('applyMyRideApp')
  .controller('TaxiController', ['$scope','$routeParams', '$location', 'flash', 'planService', 'ipCookie', 'usSpinnerService', '$http',
    function ($scope, $routeParams, $location, flash, planService, ipCookie, usSpinnerService, $http) {

      $scope.loggedIn = !!planService.email;
      //pull the selected taxi out from selected taxi option, or send to plan again
      if( planService.selectedTaxiOption >= 0 ){
        $scope.taxiItinerary = planService.taxiItineraries[ (planService.selectedTaxiOption||0) ];
      }else{
        $location.path("/plan/where");
      }

      $scope.saveTaxiTrip = function(){

        var tripId = planService.tripId;
        var selectedItineraries = [{"trip_id":tripId, "itinerary_id":planService.taxiItineraries[planService.selectedTaxiOption].id}];
        if(planService.fare_info.roundtrip == true){
          selectedItineraries.push({"trip_id":tripId, "itinerary_id":planService.taxiItineraries[planService.selectedTaxiOption].returnItinerary.id});
        }
        var selectedItineraries = {"select_itineraries": selectedItineraries};

        var promise = planService.selectItineraries($http, selectedItineraries);
        promise.then(function(result) {
          ipCookie('rideCount', ipCookie('rideCount') + 1);
          $scope.rideCount = ipCookie('rideCount');
          $scope.taxiSaved = true;
          planService.taxiSaved = true;
          bootbox.alert("Your trip has been saved");
        });

      }
      $scope.cancelThisTaxiTrip = function(){
        usSpinnerService.spin('spinner-1');
        var cancelRequest = {bookingcancellation_request: []};
        var leg1, leg2;
        leg1 = {itinerary_id: planService.taxiItineraries[planService.selectedTaxiOption].id};
        cancelRequest.bookingcancellation_request.push( leg1 );
        if(planService.fare_info.roundtrip){
          leg2 = {itinerary_id: planService.taxiItineraries[planService.selectedTaxiOption].returnItinerary.id}
          cancelRequest.bookingcancellation_request.push( leg2 );
        }
        var cancelPromise = planService.cancelTrip($http, cancelRequest)
        cancelPromise.error(function(data) {
          bootbox.alert("An error occurred, your trip was not cancelled.  Please call 1-844-PA4-RIDE for more information.");
          usSpinnerService.stop('spinner-1');
        });
        cancelPromise.success(function(data) {
          bootbox.alert('Your trip has been cancelled');
          ipCookie('rideCount', ipCookie('rideCount') - 1);
          $scope.taxiSaved = false;
          $scope.taxiCancelled = true;
          planService.taxiSaved = false;
          planService.taxiCancelled = true;
          usSpinnerService.stop('spinner-1');
        });

      }
      $scope.toggleEmail = function($event) {
        $scope.invalidEmail = false;
        $scope.showEmail = !$scope.showEmail;
        $event.stopPropagation();
      };

      $scope.sendEmail = function($event) {
        $event.stopPropagation();

        var emailString = $scope.emailString;

        if(emailString && planService.tripId){
          var result = planService.validateEmail(emailString);
          if(result == true){

            $scope.showEmail = false;

            var emailRequest = {};
            emailRequest.email_address = emailString;
            emailRequest.trip_id = planService.tripId;

            var emailPromise = planService.emailItineraries($http, emailRequest);
            emailPromise.error(function(data) {
              bootbox.alert("An error occurred on the server, your email was not sent.");
            });
            bootbox.alert('Your email was sent');
          }else{
            $scope.invalidEmail = true;
          } 
        }
      }
    }
  ]);

;
'use strict';

angular.module('applyMyRideApp')
  .controller('UberController', ['$scope','$routeParams', '$location', 'flash', 'planService', 'ipCookie', 'usSpinnerService', '$http',
    function ($scope, $routeParams, $location, flash, planService, ipCookie, usSpinnerService, $http) {

      $scope.loggedIn = !!planService.email;
      //pull the selected Uber out from selected uber option, or send to plan again
      if( planService.selectedUberOption >= 0 ){
        $scope.uberItinerary = planService.uberItineraries[ (planService.selectedUberOption||0) ];
      }else{
        $location.path("/plan/where");
      }

      $scope.saveUberTrip = function(){

        var tripId = planService.tripId;
        var selectedItineraries = [{"trip_id":tripId, "itinerary_id":planService.uberItineraries[planService.selectedUberOption].id}];
        if(planService.fare_info.roundtrip == true){
          selectedItineraries.push({"trip_id":tripId, "itinerary_id":planService.uberItineraries[planService.selectedUberOption].returnItinerary.id});
        }
        var selectedItineraries = {"select_itineraries": selectedItineraries};

        var promise = planService.selectItineraries($http, selectedItineraries);
        promise.then(function(result) {
          ipCookie('rideCount', ipCookie('rideCount') + 1);
          $scope.rideCount = ipCookie('rideCount');
          $scope.uberSaved = true;
          planService.uberSaved = true;
          bootbox.alert("Your trip has been saved");
        });

      }
      $scope.cancelThisUberTrip = function(){
        usSpinnerService.spin('spinner-1');
        var cancelRequest = {bookingcancellation_request: []};
        var leg1, leg2;
        leg1 = {itinerary_id: planService.uberItineraries[planService.selectedUberOption].id};
        cancelRequest.bookingcancellation_request.push( leg1 );
        if(planService.fare_info.roundtrip){
          leg2 = {itinerary_id: planService.uberItineraries[planService.selectedUberOption].returnItinerary.id}
          cancelRequest.bookingcancellation_request.push( leg2 );
        }
        var cancelPromise = planService.cancelTrip($http, cancelRequest)
        cancelPromise.error(function(data) {
          bootbox.alert("An error occurred, your trip was not cancelled.  Please call 1-844-PA4-RIDE for more information.");
          usSpinnerService.stop('spinner-1');
        });
        cancelPromise.success(function(data) {
          bootbox.alert('Your trip has been cancelled');
          ipCookie('rideCount', ipCookie('rideCount') - 1);
          $scope.uberSaved = false;
          $scope.uberCancelled = true;
          planService.uberSaved = false;
          planService.uberCancelled = true;
          usSpinnerService.stop('spinner-1');
        });

      }
      $scope.toggleEmail = function($event) {
        $scope.invalidEmail = false;
        $scope.showEmail = !$scope.showEmail;
        $event.stopPropagation();
      };

      $scope.sendEmail = function($event) {
        $event.stopPropagation();

        var emailString = $scope.emailString;

        if(emailString && planService.tripId){
          var result = planService.validateEmail(emailString);
          if(result == true){

            $scope.showEmail = false;

            var emailRequest = {};
            emailRequest.email_address = emailString;
            emailRequest.trip_id = planService.tripId;

            var emailPromise = planService.emailItineraries($http, emailRequest);
            emailPromise.error(function(data) {
              bootbox.alert("An error occurred on the server, your email was not sent.");
            });
            bootbox.alert('Your email was sent');
          }else{
            $scope.invalidEmail = true;
          } 
        }
      }

    }
  ]);

;
'use strict';

angular.module('applyMyRideApp')
  .controller('ItineraryController', ['$scope','$routeParams', '$location', 'flash', 'planService', '$http','ipCookie',
    function ($scope, $routeParams, $location, flash, planService, $http, ipCookie) {
      $scope.showDiv = {};
      $scope.location = $location.path();
      $scope.savedItineraryView = true;
      $scope.trip = planService.selectedTrip;
      // If a trip exists, then fetch user notification preference defaults
      if ($scope.trip && $scope.trip.mode === 'mode_transit') {
        const notificationPrefs = $scope.trip.details ? $scope.trip.details.notification_preferences : {fixed_route: []}
        planService.getUserNotificationDefaults($http).then(() => {
        /**
         *** $scope.fixedRouteReminderPref format
         * @typedef {Object} NotificationPref
         *  @property {{reminders: Object[], disabled: boolean[]}} fixed_route
         *
         * @type {NotificationPref}
         */
          $scope.fixedRouteReminderPrefs = planService.syncFixedRouteNotifications(notificationPrefs, new Date($scope.trip.itineraries[0].departure))
        })
      }

      angular.forEach($scope.trip.itineraries, function(itinerary, index) {
        planService.prepareItinerary(itinerary);
      });
      if($scope.trip.mode == 'mode_transit'){
        $scope.itineraries = $scope.trip.itineraries;
      }else if($scope.trip.mode == 'mode_taxi'){
        $scope.taxiItinerary = $scope.trip.itineraries[0];
        if($scope.trip.itineraries.length > 1){
          $scope.taxiItinerary.returnItinerary = $scope.trip.itineraries[1];
        }
        if( !$scope.taxiItinerary.cost){
          $scope.taxiItinerary.cost = $scope.taxiItinerary.fare;
        }
        if( !$scope.taxiItinerary.destination.line1 && !$scope.taxiItinerary.destination.line2){
          $scope.taxiItinerary.destination.line2 = $scope.taxiItinerary.destination.formatted_address;
          $scope.taxiItinerary.origin.line2 = $scope.taxiItinerary.origin.formatted_address;
        }
      }else if($scope.trip.mode == 'mode_ride_hailing'){
        $scope.uberItinerary = $scope.trip.itineraries[0];
        if($scope.trip.itineraries.length > 1){
          $scope.uberItinerary.returnItinerary = $scope.trip.itineraries[1];
        }
        if( !$scope.uberItinerary.cost){
          $scope.uberItinerary.cost = $scope.uberItinerary.fare;
        }
        if( !$scope.uberItinerary.destination.line1 && !$scope.uberItinerary.destination.line2){
          $scope.uberItinerary.destination.line2 = $scope.uberItinerary.destination.formatted_address;
          $scope.uberItinerary.origin.line2 = $scope.uberItinerary.origin.formatted_address;
        }
      }else if($scope.trip.mode == 'mode_walk'){
        $scope.walkItineraries = $scope.trip.itineraries;
      }else if($scope.trip.mode == 'mode_paratransit'){
        $scope.paratransitItineraries = $scope.trip.itineraries;
        $scope.liveTrip = $scope.trip.isLive ? $scope.trip : null;
        if($scope.liveTrip) {
          planService.createEtaChecker($scope, $http, ipCookie);
        }

        var firstItinerary = $scope.trip.itineraries[0];

        angular.forEach($scope.paratransitItineraries, function(result, index) {
          result.wait_startDesc = moment.parseZone(result.wait_start).format('h:mm a');
          result.wait_endDesc = moment.parseZone(result.wait_end).format('h:mm a');
          result.arrivalDesc = moment(result.arrival).format('h:mm a');
        });

        $scope.escort = "";

        if (firstItinerary.assistant == true) {
          $scope.escort += "1 Escort";
        }

        if(firstItinerary.companions != null && firstItinerary.companions > 0){
          if ($scope.escort) {
            $scope.escort += ', ';
          }
          $scope.escort += firstItinerary.companions  + ' Companion';
          if (firstItinerary.companions > 1) {
            $scope.escort += 's';
          }
        }

        if ($scope.escort.length == 0) {
          $scope.escort = 'N/A';
        }

      }
      $scope.mode = $scope.trip.mode;
      if($scope.trip.itineraries.length > 0){
        $scope.tripCancelled = $scope.trip.itineraries[0].status == "canceled" ? true : false;
      }

      $scope.updateTransitTripReminders = function($event) {
        $event.preventDefault()
        // merge old notification preferences with updated ones
        const tripDetails = {
          notification_preferences: {
            ...planService.selectedTrip.details.notification_preferences,
            fixed_route: $scope.fixedRouteReminderPrefs.reminders
          }
        }
        // grab trip id(s) and build update trip request object
        const trip = $scope.trip.id
        const updateTripRequest = {trip, details: tripDetails}

        const planPromise = planService.updateTripDetails($http, updateTripRequest)
          planPromise.then(function(results) {
            const notificationPrefs = results.data.trip[0].details.notification_preferences
            $scope.fixedRouteReminderPrefs = planService.syncFixedRouteNotifications(notificationPrefs, new Date($scope.trip.itineraries[0].departure))
            bootbox.alert("Trip notification preferences updated!")
          })
      }

      $scope.cancelTrip = function(){

        $scope.trip = planService.selectedTrip;
        var message = "Are you sure you want to cancel this ride?";

        if($scope.trip.itineraries.length > 1 &&  !$scope.outboundCancelled &&  !$scope.returnCancelled){
          
          // DEAL WITH Round Trips
          bootbox.prompt({
              title: message,
              message: '<p>Please select an option below:</p>',
              inputType: 'radio',
              inputOptions: [
              {
                  text: 'Cancel Entire Trip',
                  value: 'BOTH',
              },
              {
                  text: 'Cancel Outbound Trip Only',
                  value: 'OUTBOUND',
              },
              {
                  text: 'Cancel Return Trip Only',
                  value: 'RETURN',
              }
              ],
              buttons: {
                  'cancel': {
                    label: 'Keep Ride'
                  },
                  'confirm': {
                    label: 'Cancel Ride'
                  }
              },
              callback: function(result){
                $scope.cancelCall(result);
              }
          });
        }else{

        // DEAL WITH 1 Way Trips
        bootbox.confirm({
          message: message,
          buttons: {
            'cancel': {
              label: 'Keep Ride'
            },
            'confirm': {
              label: 'Cancel Ride'
            }
          },
          callback: function(result){
            if(result){
              if($scope.outboundCancelled){
                 $scope.cancelCall('RETURN')
              } else if($scope.returnCancelled){
                 $scope.cancelCall('OUTBOUND')
              } else {
                $scope.cancelCall('BOTH')
              }
            }
          }
        })
      }
      }

      $scope.cancelCall = function(result){
        if(result != 'BOTH' && result != 'OUTBOUND' && result != 'RETURN'){
          return;
        }

        var itinsToCancel; 
        var successMessage;
        if(result == 'BOTH'){
          itinsToCancel = $scope.trip.itineraries;
          successMessage = 'Your trip has been cancelled.';
        }
        else if(result == 'OUTBOUND'){
          itinsToCancel = [$scope.trip.itineraries[0]];
          successMessage = 'Your outbound trip has been cancelled.';
        } else if(result == 'RETURN'){
          itinsToCancel = [$scope.trip.itineraries[$scope.trip.itineraries.length - 1]];
          successMessage = 'Your return trip has been cancelled.';
        }
        
        var cancel = {};

        cancel.bookingcancellation_request = [];
        angular.forEach(itinsToCancel, function(itinerary, index) {
          var bookingCancellation = {};
          if(($scope.trip.mode == 'mode_transit' || $scope.trip.mode == 'mode_taxi' || $scope.trip.mode == 'mode_ride_hailing' || $scope.trip.mode == 'mode_walk') && itinerary.id){
            bookingCancellation.itinerary_id = itinerary.id;
          }
          else if($scope.trip.mode == 'mode_paratransit' && itinerary.booking_confirmation){
            bookingCancellation.booking_confirmation = itinerary.booking_confirmation;
          }
          cancel.bookingcancellation_request.push(bookingCancellation);
        });
        var cancelPromise = planService.cancelTrip($http, cancel)
        cancelPromise.error(function(data) {
          bootbox.alert("An error occurred, your trip was not cancelled.  Please call 1-844-PA4-RIDE for more information.");
        });
        cancelPromise.success(function(data) {
          bootbox.alert(successMessage);
          if(result == 'BOTH'){
            $scope.tripCancelled = true;
            ipCookie('rideCount', ipCookie('rideCount') - 1);
          }
          else if(result == 'OUTBOUND'){
            $scope.outboundCancelled = true;
            if($scope.returnCancelled){
              ipCookie('rideCount', ipCookie('rideCount') - 1);
            }
          }else if(result == 'RETURN'){
            $scope.returnCancelled = true;
            if($scope.outboundCancelled){
              ipCookie('rideCount', ipCookie('rideCount') - 1);
            }
          }
        })
      }

      $scope.show = function(event){
        const index = $(event.target).parents('.accordion').attr('index');
        $scope.showDiv[index] = !$scope.showDiv[index];
      }

      $scope.viewMyRides = function() {
        $location.path("/plan/my_rides");
      };

      $scope.toggleEmail = function($event) {
        $scope.invalidEmail = false;
        $scope.showEmail = !$scope.showEmail;
        $event.stopPropagation();
      };

      $scope.sendEmail = function($event) {
        $event.stopPropagation();
        var trip = $scope.trip;
        var emailString = $scope.emailString;

        if(emailString){
          var result = planService.validateEmail(emailString);
          if(result == true){

            $scope.showEmail = false;

            var emailRequest = {};
            emailRequest.email_address = emailString;

            angular.forEach(trip.itineraries, function(itinerary, index) {
              if(itinerary.mode === "mode_paratransit"){
                if(index == 0){
                  emailRequest.booking_confirmations = [];
                }
                emailRequest.booking_confirmations.push(itinerary.booking_confirmation);
              }
              else if(index == 0){
                emailRequest.trip_id = itinerary.trip_id.toString();
              }
            });

            var emailPromise = planService.emailItineraries($http, emailRequest);
            emailPromise.error(function(data) {
              bootbox.alert("An error occurred on the server, your email was not sent.");
            });
            bootbox.alert('Your email was sent');
          }else{
            $scope.invalidEmail = true;
          }
        }
      }

      $scope.$on("$destroy", function () {
        planService.killEtaChecker();
      });
    }
]);

;
'use strict';

angular.module('applyMyRideApp')
  .controller('ProfileController', ['$scope', '$location', 'flash', 'planService', '$http', 'ipCookie', '$window',
    function ($scope, $location, flash, planService, $http, ipCookie, $window) {
      $scope.location = $location.path();
      $scope.editable = false;
      var profilePromise = planService.getProfile($http);
      profilePromise.then(function(results){
        $scope.profile = results.data;
        $scope.email = $scope.profile.email;
        if($scope.email == "")
            $scope.email_editable = false;
        else
            $scope.email_editable = true;

      });


      $scope.toggleEdit = function() {
        if($scope.editable == true){
          if($scope.email_editable){
            $scope.invalidEmail = !planService.validateEmail($scope.email);
          }
          else{
            $scope.invalidEmail = false;
          }


          if($scope.invalidEmail == false ) {


            var profileUpdate = {};
                
            profileUpdate.attributes = {};
            
            if($scope.email){
              profileUpdate.attributes.email = $scope.email;
            }

            planService.profileUpdateObject = profileUpdate;
            planService.postProfileUpdate($http)
            .then(function(result){
              if($scope.email_editable && result.statusText === 'OK'){
                planService.email = $scope.email;
                ipCookie('email', planService.email, {expires: 7, expirationUnit: 'days'});
              }
            });
          }
        }else{
          $scope.editable = true;
          if($scope.email == "")
            $scope.email_editable = false;
          else
            $scope.email_editable = true;
        }
      };
    }

  ]);

;
/*
 Angular Clear Input directive
 (c) 2014 Nir Shilon. http://flz.co.il
 */
angular.module('dcbClearInput', [])
  .directive('clearInput', ['$parse',
    function($parse) {
      return {
        restrict: 'A',
        require: 'ngModel',
        link: function(scope, element, attr) {
          var htmlMarkup = attr.clearBtnMarkup ? attr.clearBtnMarkup : '<img src="images/close.png"/>';
          var btn = angular.element(htmlMarkup);
          btn.addClass(attr.clearBtnClass ? attr.clearBtnClass : "clear-btn");
          element.after(btn);

          btn.on('click', function(event) {
            if (attr.clearInput) {
              var fn = $parse(attr.clearInput);
              scope.$apply(function() {
                fn(scope, {
                  $event: event
                });
              });
            } else {
              scope[attr.ngModel] = null;
              scope.$digest();
            }
          });

          scope.$watch(attr.ngModel, function(val) {
            var hasValue = val && val.length > 0;
            if (!attr.clearDisableVisibility) {
              btn.css('visibility', hasValue ? 'visible' : 'hidden');
            }

            if (hasValue && !btn.hasClass('clear-visible')) {
              btn.removeClass('clear-hidden').addClass('clear-visible');
            } else if (!hasValue && !btn.hasClass('clear-hidden')) {
              btn.removeClass('clear-visible').addClass('clear-hidden');
            }
          });
        }
      };
    }
  ]);

;
'use strict';

var app = angular.module('applyMyRideApp');

app.directive('birthdaypicker', function() {

    return {
        restrict: 'E',
        scope: {
            selected: '=stime'
        },
      controller: ['$scope', function($scope){

        $scope.parseBirthdate = function(){
          var selectedYear = parseInt(this.birthyear, 10);
          var selectedMonth = parseInt(this.birthmonth, 10);
          var selectedDay = parseInt(this.birthday, 10);
          var maxDay = (new Date(selectedYear, selectedMonth, 0)).getDate();
          if(selectedDay <= maxDay){
            $scope.$parent.dateofbirth = (new Date(selectedYear, selectedMonth - 1, selectedDay))
          }else{
            $scope.$parent.dateofbirth = null;
          }
        }


      }],
        link: function(scope) {
          scope.months = {
              "short": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
              "long": ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] };
          scope.todayDate = new Date();
          scope.todayYear = scope.todayDate.getFullYear();
          scope.todayMonth = scope.todayDate.getMonth();
          scope.todayDay = scope.todayDate.getDate();
          scope.years = [];
          for(var i = 0; i < 120; i++){
            scope.years.push(scope.todayYear - i);
          }
          scope.settings = {
            "maxAge"        : 120,
            "minAge"        : 0,
            "futureDates"   : false,
            "maxYear"       : scope.todayYear,
            "dateFormat"    : "middleEndian",
            "monthFormat"   : "short",
            "placeholder"   : true,
            "legend"        : "",
            "defaultDate"   : false,
            "fieldName"     : "birthdate",
            "fieldId"       : "birthdate",
            "hiddenDate"    : true,
            "onChange"      : null,
            "tabindex"      : null
          };

        },
      template: '<div id="birthdayPicker">\
        <fieldset class="birthday-picker">\
        <select class="birth-month" name="birth[month]" ng-change="parseBirthdate()" ng-model="birthmonth" >\
        <option value="" selected="true">Month:</option>\
        <option value="1">Jan</option>\
        <option value="2">Feb</option>\
        <option value="3">Mar</option>\
        <option value="4">Apr</option>\
        <option value="5">May</option>\
        <option value="6">Jun</option>\
        <option value="7">Jul</option>\
        <option value="8">Aug</option>\
        <option value="9">Sep</option>\
        <option value="10">Oct</option>\
        <option value="11">Nov</option>\
        <option value="12">Dec</option>\
        </select>\
        <select class="birth-day" name="birth[day]" ng-change="parseBirthdate()" ng-model="birthday">\
        <option value="">Day:</option>\
        <option value="1">1</option>\
        <option value="2">2</option>\
        <option value="3">3</option>\
        <option value="4">4</option>\
        <option value="5">5</option>\
        <option value="6">6</option>\
        <option value="7">7</option>\
        <option value="8">8</option>\
        <option value="9">9</option>\
        <option value="10">10</option>\
        <option value="11">11</option>\
        <option value="12">12</option>\
        <option value="13">13</option>\
        <option value="14">14</option>\
        <option value="15">15</option>\
        <option value="16">16</option>\
        <option value="17">17</option>\
        <option value="18">18</option>\
        <option value="19">19</option>\
        <option value="20">20</option>\
        <option value="21">21</option>\
        <option value="22">22</option>\
        <option value="23">23</option>\
        <option value="24">24</option>\
        <option value="25">25</option>\
        <option value="26">26</option>\
        <option value="27">27</option>\
        <option value="28">28</option>\
        <option value="29">29</option>\
        <option value="30">30</option>\
        <option value="31">31</option>\
        </select>\
        <select class="birth-year" name="birth[year]" ng-change="parseBirthdate()" ng-model="birthyear">\
        <option value="">Year:</option>\
        <option\
              ng-repeat="year in years"\
              val="{{ year }}"\
              ng-class="{ active: ($index === selectedIndex && suggestion.option), selectable: (suggestion.option) }"\
              >{{ year }}</li>\
        </select>\
        <input type="hidden" name="birthdate" id="birthdate" value="">\
        </fieldset>\
        {{ dateofbirth}} \
        </div>'
    };

});

;
'use strict';


angular.module('applyMyRideApp')
.filter('free', function() {
  return function(input) {
    return input == '$0.00' ? "Free" : input;
  };
})
.filter('minutes', function() {
  return function(m) {
    if(m <= 60){
      return '' + m + ' minutes';
    }else{
      return '' 
        + (Math.floor( m/60 )) + ' hours, '
        + (m % 60) + ' minutes';
    }
    if(!m || !m._isAMomentObject){ return ''; }
    return m.format('YY-MM-DD');
  };
})
.filter('seconds', function() {
  return function(s) {
    var m = Math.ceil( s/60 );
    if(m <= 60){
      return '' + m + ' min';
    }else{
      return '' 
        + (Math.floor( m/60 )) + ' hr, '
        + (m % 60) + ' min';
    }
    if(!m || !m._isAMomentObject){ return ''; }
    return m.format('YY-MM-DD');
  };
}).filter('momentYMD', function() {
  return function(m) {
    if(!m || !m._isAMomentObject){ return ''; }
    return m.format('YY-MM-DD');
  };
})
.filter('noCountry', function() {
  return function(addressString) {
    //filters ", USA" or ", United States" from the end$ of strings. comma optional
    var country = /(, )?(United States|USA)$/;
    return (addressString || '').replace(country, '').trim();
  };
})
.filter('telephoneLink', function(){
  return function(tel){
    //strip all non-numeric chars
    if(!tel){return '';}
    tel = tel.toString().trim().replace(/\D/g, '');
    //prepend 1 if not there
    if(tel.charAt(0) !== 1){
      tel = '1'+tel;
    }
    return 'tel:+' + tel;
  }
})
.filter('roundUp', function() {
  return function(up){
    //parse as float then round up
    return ''+ Math.ceil( parseFloat( up || 1) )
  }
})
.filter('momentFormat', function() {
  return function(m, f) {
    if(!m || !m._isAMomentObject){ return ''; }
    return m.format( f );
  };
})
.filter('encodeURI', function() {
    return window.encodeURIComponent;
})
.filter('momentHMA', function() {
  return function(m) {
    if(!m || !m._isAMomentObject){ return ''; }
    return m.format('h:mm a');
  };
});
;
'use strict';


angular.module('applyMyRideApp')
    .service('planService', ['$rootScope', '$filter', '$interval', 'util', function($rootScope, $filter, $interval, util) {

      this.reset = function(){
        this.resetOther();
        this.resetCompanions();
        this.resetWhen();
        this.resetPurpose();
        this.resetWhere();
      }

      this.resetWhere = function () {
        delete this.from;
        delete this.fromDetails;
        delete this.to;
        delete this.toDetails;
      };

      this.resetPurpose = function () {
        delete this.purpose;
      };

      this.resetWhen = function () {
        delete this.fromDate;
        delete this.fromTime;
        delete this.fromTimeType;
        delete this.returnDate;
        delete this.returnTime;
        delete this.returnTimeType;
        delete this.serviceOpen;
        delete this.serviceClose;
      };

      this.resetCompanions = function () {
        delete this.numberOfCompanions;
        delete this.hasCompanions;
        delete this.hasEscort;
      }

      this.resetOther = function () {
        delete this.driverInstructions;
        delete this.transitSaved;
        delete this.transitCancelled;
        delete this.taxiSaved;
        delete this.taxiCancelled;
        delete this.uberSaved;
        delete this.uberCancelled;
        delete this.walkSaved;
        delete this.walkCancelled;
        delete this.selectedBusOption;
        delete this.selectedTaxiOption;
        delete this.selectedUberOption;
        delete this.showBusRides;
      };

      var urlPrefix = '//' + APIHOST + '/';
      this.getPrebookingQuestions = function () {
        var questions = this.paratransitItineraries[0].prebooking_questions;
        var questionObj = {};
        angular.forEach(questions, function(question, index) {
          if (question.code == 'assistant') {
            questionObj.assistant = question.question;
          } else if (question.code == 'children' || question.code == 'companions') {
            questionObj.children = question.question;
            questionObj.limit = question.choices;
          }
        });
        return questionObj;
      }

      this.emailItineraries = function($http, emailRequest){
        return $http.post(urlPrefix + 'api/v1/trips/email', emailRequest, this.getHeaders())
      }

      this.cancelTrip = function($http, cancelRequest){
        return $http.post(urlPrefix + 'api/v1/itineraries/cancel', cancelRequest, this.getHeaders())
      }

      this.validateEmail = function(emailString){
        var addresses = emailString.split(/[ ,;]+/);
        var valid = true;
        var that = this;
        angular.forEach(addresses, function(address, index) {
          var result = that.validateEmailAddress(address);
          if(result == false){
            valid = false;
          }
        });
        return valid;
      }

      this.validateEmailAddress = function(email) {
        var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
        return re.test(email);
      }

      this.getPastRides = function($http) {
        return this.getRidesByType($http, 'api/v1/trips/past_trips');
      }

      this.getFutureRides = function($http) {
        return this.getRidesByType($http, 'api/v1/trips/future_trips');
      }

      // Make API call to get past or future trips
      this.getRidesByType = function($http, urlPath) {
        return $http.get(urlPrefix + urlPath, this.getHeaders());
      }

      // Takes trips data and unpacks/processes them into an array of trip objects
      this.unpackTrips = function(tripsData, tripType) {
        var that = this;
        var sortable = [],
            trips = [];
        angular.forEach(tripsData, function(trip, index) {
          if(trip[0].departure && trip[0].status && (trip[0].status != "canceled" || tripType == 'past')){
            var trip_with_itineraries = that.addItinerariesToTrip(trip);
            sortable.push([trip_with_itineraries, trip[0].departure])
          }
        });

        sortable.sort(function(a,b) {
          return util.dateISOSortComparer(a,b, tripType == 'next');
        });

        angular.forEach(sortable, function(trip_and_departure_array, index) {
          trips.push(trip_and_departure_array[0]);
        });

        return trips;
      }

      // Adds itineraries to trip object
      this.addItinerariesToTrip = function(trip) {
        var i = 0;
        var trip_with_itineraries = {};
        var that = this;

        trip_with_itineraries.itineraries = [];

        while(typeof trip[i] !== 'undefined'){

          // Check for first itinerary to set Trip values
          if(i == 0){
            trip_with_itineraries.id = trip[i].trip_id;
            trip_with_itineraries.details = trip[i].details;
            trip_with_itineraries.mode = trip[i].mode;
            trip_with_itineraries.startDesc = that.getDateDescription(trip[i].wait_start || trip[i].departure);
            trip_with_itineraries.startDesc += " at " + moment.parseZone(trip[i].wait_start || trip[i].departure).format('h:mm a');

            var origin_addresses = trip[0].origin.address_components;
            for(var n = 0; n < origin_addresses.length; n++){
              var address_types = origin_addresses[n].types ;
              if(address_types.length > 0 && address_types.indexOf("street_address") != -1){
                trip_with_itineraries.from_place = origin_addresses[n].short_name;
                break;
              }
            }

            if(!trip_with_itineraries.from_place && trip[0].origin.name){
              trip_with_itineraries.from_place = trip[0].origin.name;
            } else if (!trip_with_itineraries.from_place && trip[0].origin.formatted_address) {
              trip_with_itineraries.from_place = trip[0].origin.formatted_address;
            }

            var destination_addresses = trip[0].destination.address_components;
            for(var j = 0; j < destination_addresses.length; j++){
              var address_types = destination_addresses[j].types ;
              if(address_types.length > 0 && address_types.indexOf("street_address") != -1){
                trip_with_itineraries.to_place = destination_addresses[j].short_name;
                break;
              }
            }

            if(!trip_with_itineraries.to_place && trip[0].destination.name){
              trip_with_itineraries.to_place = trip[0].destination.name;
            } else if(!trip_with_itineraries.to_place && trip[0].destination.formatted_address){
              trip_with_itineraries.to_place = trip[0].destination.formatted_address;
            }

          }

          trip_with_itineraries.itineraries.push(trip[i]);
          i++;
        }

        trip_with_itineraries.roundTrip = typeof trip[1] !== 'undefined' ? true : false;
        return trip_with_itineraries;
      }

      this.populateScopeWithTripsData = function($scope, trips, tripType) {
        var planService = this;
        if($scope.trip) {
          // Itinerary View
          $scope.trip = planService.findLiveTrip(trips);
        } else {
          // Plan/MyTrips View
          $scope.trips = $scope.trips || {};
          $scope.trips[tripType] = trips;
        }
      }

      this.prepareSummaryPage = function($scope) {
        let request = {};
        let itineraryRequestObject = this.createItineraryRequest();
        this.itineraryRequestObject = itineraryRequestObject;
        let outboundTime = itineraryRequestObject.trips[0].trip.trip_time;

        request.fromLine1 = itineraryRequestObject.trips[0].trip.origin_attributes.name || itineraryRequestObject.trips[0].trip.origin_attributes.street_address;
        request.fromLine2 = itineraryRequestObject.trips[0].trip.origin_attributes.formatted_address;
        request.toLine1 = itineraryRequestObject.trips[0].trip.destination_attributes.name || itineraryRequestObject.trips[0].trip.destination_attributes.street_address;
        request.toLine2 = itineraryRequestObject.trips[0].trip.destination_attributes.formatted_address;

        request.purpose = itineraryRequestObject.trips[0].trip.external_purpose
        request.when1 = this.getDateDescription(outboundTime);
        request.when2 = "Arrive by " + moment(outboundTime).format('h:mm a');
        
        if (itineraryRequestObject.trips.length > 1) {
          request.roundtrip = true;
          var returnTime = itineraryRequestObject.trips[1].trip.trip_time;
          request.when3 = this.getDateDescription(returnTime);
          if (request.when1 == request.when3) {
            request.sameday = true;
          }
          request.when4 = "Leave at " + moment(returnTime).format('h:mm a');
        }

        request.when = [request.when1, request.when2, request.when4].filter(x => x).join(" | ");
        $scope.request = request;
        this.confirmRequest = request;
      }

      this.prepareTripSearchResultsPage = function(){
        this.transitItineraries = [];
        this.paratransitItineraries = [];

        // TODO (Drew Teter, 09/22/2022) Fully Remove ability for guest login.
        // We plan on doing this in the future, but as no tickets have been created
        // for this task yet, I'm just commenting out this line for now.

        // this.guestParatransitItinerary = null;

        this.taxiItineraries = [];
        this.uberItineraries = [];
        this.walkItineraries = [];
        this.tripId = this.searchResults.trip_id;
        var currencyFilter = $filter('currency');
        var freeFilter = $filter('free');
        var itineraries = this.searchResults.itineraries;
        var itinerariesBySegmentThenMode = this.getItinerariesBySegmentAndMode(itineraries);
        var fare_info = {};
        fare_info.roundtrip = false;
        if(this.itineraryRequestObject.trips.length > 1){
          fare_info.roundtrip = true;
        }
        var that = this;
        angular.forEach(Object.keys(itinerariesBySegmentThenMode), function(segmentIndex, index) {
          var itinerariesByMode = itinerariesBySegmentThenMode[segmentIndex];
          angular.forEach(Object.keys(itinerariesByMode), function(mode_code, index) {
            var fares = [];
            angular.forEach(itinerariesByMode[mode_code], function(itinerary, index) {
              if(itinerary.cost){
                var fare = parseFloat(Math.round(itinerary.cost * 100) / 100).toFixed(2);
                itinerary.cost = fare;
                fares.push(fare);
              } else if (itinerary.discounts){
                itinerary.travelTime = humanizeDuration(itinerary.duration * 1000,  { units: ["hours", "minutes"], round: true });
                itinerary.startTime = moment(itinerary.start_time).format('h:mm a')

                // TODO (Drew Teter, 09/22/2022) Fully Remove ability for guest login.
                // We plan on doing this in the future, but as no tickets have been created
                // for this task yet, I'm just commenting out this line for now.

                // that.guestParatransitItinerary = itinerary;

                angular.forEach(itinerary.discounts, function(discount, index) {
                  var fare = parseFloat(Math.round(discount.fare * 100) / 100).toFixed(2);
                  fares.push(fare);
                });
              }
            });

            if(fares.length > 0){
              var lowestFare = Math.min.apply(null, fares).toFixed(2);
              var highestFare = Math.max.apply(null, fares).toFixed(2);
              lowestFare = currencyFilter(lowestFare);
              highestFare = currencyFilter(highestFare);
              if(lowestFare == highestFare || (mode_code == 'mode_paratransit' && that.email)){
                fare_info[[mode_code]] = freeFilter(lowestFare);  //if the user is registered, show the lowest paratransit fare
              }else{
                fare_info[[mode_code]] = lowestFare + "-" + highestFare;
              }
            }
          });
        });

        var itinerariesByModeOutbound = itinerariesBySegmentThenMode ? itinerariesBySegmentThenMode[0] : null;
        var itinerariesByModeReturn = itinerariesBySegmentThenMode ? itinerariesBySegmentThenMode[1] : null;

        if(itinerariesByModeOutbound){
          if(itinerariesByModeOutbound.mode_paratransit){
              var lowestPricedParatransitTrip = this.getLowestPricedParatransitTrip(itinerariesByModeOutbound.mode_paratransit);
              
              if(!this.email){
                // TODO (Drew Teter, 09/22/2022) Fully Remove ability for guest login.
                // We plan on doing this in the future, but as no tickets have been created
                // for this task yet, I'm commenting out this line and raising an error.

                // guest user, just use the first paratransit itinerary since the prices are unknown
                // lowestPricedParatransitTrip = this.guestParatransitItinerary;
                throw 'PlanService object does not have an email. Guest accounts are not allowed. 1 of 3';
                return;
              }

              if(lowestPricedParatransitTrip){
                this.paratransitItineraries.push(lowestPricedParatransitTrip);
                fare_info.paratransitTravelTime = lowestPricedParatransitTrip.travelTime;
                fare_info.paratransitStartTime = lowestPricedParatransitTrip.startTime;
              }
          }


          if(itinerariesByModeOutbound.mode_transit){
              this.transitItineraries.push(itinerariesByModeOutbound.mode_transit);
          }

          //Taxi trips are grouped by taxi company, ordered low to high
          if(itinerariesByModeOutbound.mode_taxi){
              this.taxiItineraries = itinerariesByModeOutbound.mode_taxi;
          }

          if(itinerariesByModeOutbound.mode_ride_hailing ){
              this.uberItineraries = itinerariesByModeOutbound.mode_ride_hailing;
          }

          if(itinerariesByModeOutbound.mode_walk){
              this.walkItineraries.push(itinerariesByModeOutbound.mode_walk[0]);
          }
        }

        //if a mode doesn't appear in both outbound and return itinerary lists, remove it

        if(itinerariesByModeReturn && fare_info.roundtrip == true){
          if(itinerariesByModeReturn.mode_transit){
            this.transitItineraries.push(itinerariesByModeReturn.mode_transit);
          }else{
            this.transitItineraries = [];
          }

          if (!this.email) {
            // TODO (Drew Teter, 09/22/2022) Fully Remove ability for guest login.
            // We plan on doing this in the future, but as no tickets have been created
            // for this task yet, I'm raising an error.

            throw 'PlanService object does not have an email. Guest accounts are not allowed. 2 of 3';
            return;
          }

          if (itinerariesByModeReturn.mode_paratransit) {
            var lowestPricedParatransitTrip = this.getLowestPricedParatransitTrip(itinerariesByModeReturn.mode_paratransit);
            if(lowestPricedParatransitTrip){
              this.paratransitItineraries.push(lowestPricedParatransitTrip);
            }else{
              this.paratransitItineraries = [];
            }
          }

          if(itinerariesByModeReturn.mode_taxi){
            //merge the return itineraries into the other itineraries, matching the service_ids
            itinerariesByModeReturn.mode_taxi.forEach(function(returnItinerary){
              //find the matching taxiItinerary, merge into that
              that.taxiItineraries.forEach(function(departItinerary){
                if(departItinerary.service_id == returnItinerary.service_id){
                  departItinerary.returnItinerary = returnItinerary;
                }
              })
            });
          }else{
            this.taxiItineraries = [];
          }

          if(itinerariesByModeReturn.mode_ride_hailing){
            //merge the return itineraries into the other itineraries, matching the service_ids
            itinerariesByModeReturn.mode_ride_hailing.forEach(function(returnItinerary){
              //find the matching itinerary, merge into that
              that.uberItineraries.forEach(function(departItinerary){
                if(departItinerary.service_id == returnItinerary.service_id){
                  departItinerary.returnItinerary = returnItinerary;
                }
              })
            });
          }else{
            this.uberItineraries = [];
          }

          if(itinerariesByModeReturn.mode_walk){
            this.walkItineraries.push(itinerariesByModeReturn.mode_walk[0]);
          }else{
            this.walkItineraries = [];
          }
        }

        this.transitInfos = [];
        if(itinerariesByModeOutbound && itinerariesByModeOutbound.mode_transit){
          this.transitInfos.push(this.prepareTransitOptionsPage(itinerariesBySegmentThenMode[0].mode_transit));

          //check for return, reseet transitInfos if this is round trip and no return
          if(itinerariesByModeReturn && itinerariesByModeReturn.mode_transit){
            //for round trips, show the fare as the sum of the two recommended fares
            this.transitInfos.push(this.prepareTransitOptionsPage(itinerariesBySegmentThenMode[1].mode_transit));
            if(this.selectedBusOption){
              var fare1 = this.transitInfos[0][ this.selectedBusOption[0] ].cost;
              var fare2 = this.transitInfos[1][ this.selectedBusOption[1] ].cost;
            }
            else{
              var fare1 = this.transitInfos[0][0].cost;
              var fare2 = this.transitInfos[1][0].cost;
            }
            fare_info.mode_transit = freeFilter(currencyFilter( (new Number(fare1) + new Number(fare2)).toFixed(2).toString() ));
          }else if (fare_info.roundtrip == true){
            this.transitInfos = [];
          }
        }

        if (this.email) {
          if(this.paratransitItineraries.length > 1){
            //for round trips, show the fare as the sum of the two PARATRANSIT fares
            var fare1 = this.paratransitItineraries[0].cost || 0;
            var fare2 = this.paratransitItineraries[1].cost || 0;
            fare_info.mode_paratransit = freeFilter(currencyFilter( (new Number(fare1) + new Number(fare2)).toFixed(2).toString() ));
          }else if(this.paratransitItineraries.length == 1){
            fare_info.mode_paratransit = freeFilter(currencyFilter( new Number(this.paratransitItineraries[0].cost).toFixed(2).toString() ));
          }
        } else {
          // TODO (Drew Teter, 09/22/2022) Fully Remove ability for guest login.
          // We plan on doing this in the future, but as no tickets have been created
          // for this task yet, I'm raising an error.

          throw 'PlanService object does not have an email. Guest accounts are not allowed. 3 of 3';
          return;
        }
        this.fare_info = fare_info;
      }

      this.getLowestPricedParatransitTrip = function(paratransitTrips){
        var lowestPricedParatransitTrip;
        angular.forEach(paratransitTrips, function(paratransitTrip, index) {
          if( isNaN( parseInt( paratransitTrip.cost )) ){
            paratransitTrip.cost = 0;
          }
          if (isNaN(parseInt(paratransitTrip.duration))) {
            paratransitTrip.duration = 0;
          }
          if ((paratransitTrip.duration >= 0) && paratransitTrip.start_time && paratransitTrip.cost >= 0) {
            paratransitTrip.travelTime = humanizeDuration(paratransitTrip.duration * 1000, {
              units: ["hours", "minutes"],
              round: true
            });
            paratransitTrip.startTime = moment(paratransitTrip.start_time).format('h:mm a')
            if (!lowestPricedParatransitTrip) {
              lowestPricedParatransitTrip = paratransitTrip;
            } else {
              if (Number(paratransitTrip.cost) < Number(lowestPricedParatransitTrip.cost)) {
                lowestPricedParatransitTrip = paratransitTrip;
              }
            }
            lowestPricedParatransitTrip.travelTime = humanizeDuration(paratransitTrip.duration * 1000,  { units: ["hours", "minutes"], round: true });
            lowestPricedParatransitTrip.startTime = moment(paratransitTrip.start_time).format('h:mm a')
          }
        });
        return lowestPricedParatransitTrip;
      }

      this.getItinerariesBySegmentAndMode = function(itineraries){
        var itinerariesBySegmentThenMode = {};
        var that = this;
        angular.forEach(itineraries, function(itinerary, index) {

          that.prepareItinerary(itinerary);
          var mode = itinerary.returned_mode_code;
          var segment_index = itinerary.segment_index;
          if (itinerariesBySegmentThenMode[segment_index] == undefined){
            itinerariesBySegmentThenMode[segment_index] = {};
          }
          if (itinerariesBySegmentThenMode[segment_index][mode] == undefined){
            itinerariesBySegmentThenMode[segment_index][mode] = [];
          }
          itinerariesBySegmentThenMode[segment_index][mode].push(itinerary);
        }, itinerariesBySegmentThenMode);
        return itinerariesBySegmentThenMode;
      }

      this.prepareTransitOptionsPage = function(transitItineraries){
        var transitInfos = [];
        angular.forEach(transitItineraries, function(itinerary, index) {
          var transitInfo = {};
          transitInfo.id = itinerary.id;
          transitInfo.cost = itinerary.cost;
          transitInfo.startTime = itinerary.start_time;
          transitInfo.startDesc = itinerary.startTimeDesc;
          transitInfo.endDesc = itinerary.endTimeDesc;
          transitInfo.travelTime = itinerary.travelTime;
          transitInfo.duration = itinerary.duration;
          var found = false;
          angular.forEach(itinerary.json_legs, function(leg, index) {
            if(!found && (leg.mode == 'BUS' || leg.mode == 'RAIL' || leg.mode == 'SUBWAY' || leg.mode == 'TRAM')){
              transitInfo.mode = leg.mode;
              transitInfo.route = leg.routeShortName;
              found = true;
            }
          });
          transitInfo.walkTime = itinerary.walkTimeDesc;
          transitInfo.walkTimeInSecs = itinerary.walk_time;
          transitInfos.push(transitInfo);
        }, transitInfos);

        angular.forEach(transitInfos, function(transitInfo, index) {
          if(index == 0){
            transitInfo.label = "Recommended"
            return;
          }

          var best = transitInfos[0];
          if(transitInfo.cost < best.cost){
            transitInfo.label = "Cheaper"
          } else if (transitInfo.walkTimeInSecs < best.walkTimeInSecs / 2){
            transitInfo.label = "Less Walking"
          }else if (transitInfo.duration < best.duration){
            transitInfo.label = "Faster"
          } else if (transitInfo.walkTimeInSecs < best.walkTimeInSecs){
            transitInfo.label = "Less Walking"
          } else if(transitInfo.cost > best.cost){
            transitInfo.label = "More Expensive"
          } else if (transitInfo.startTime < best.startTime){
            transitInfo.label = "Earlier"
          } else if (transitInfo.startTime > best.startTime){
            transitInfo.label = "Later"
          }else{
            transitInfo.label = "Similar"
          }
        });
        return transitInfos;
      }

      this.prepareItinerary = function(itinerary){
        this.setItineraryDescriptions(itinerary);
        if(itinerary.cost){
          itinerary.cost = parseFloat(Math.round(itinerary.cost * 100) / 100).toFixed(2);
        }
        if(itinerary.json_legs){
          var that = this;
          angular.forEach(itinerary.json_legs, function(leg, index) {
            that.setItineraryLegDescriptions(leg);
            if(leg.steps){
              angular.forEach(leg.steps, function(step, index) {
                that.setWalkingDescriptions(step);
              });
            }
          });
          itinerary.destinationDesc = itinerary.json_legs[itinerary.json_legs.length - 1].to.name;
          itinerary.destinationTimeDesc = itinerary.json_legs[itinerary.json_legs.length - 1].endTimeDesc;
        }
      }

      // Returns a string describing the distance in appropriate units (miles or feet)
      this.getDistanceDescription = function(distance_in_meters) {
        var distance_in_miles = distance_in_meters * 0.000621371;
        if(distance_in_miles <= 0.189394) {
          var distance_in_feet = Math.ceil(distance_in_miles * 5280);
          return distance_in_feet + " feet";
        } else {
          return distance_in_miles.toFixed(2) + " miles";
        }
      }

      this.setItineraryDescriptions = function(itinerary){
        var startTime = itinerary.wait_start || itinerary.departure || itinerary.start_time;
        itinerary.startDesc = this.getDateDescription(startTime);
        itinerary.startDesc += " at " + moment.parseZone(startTime).format('h:mm a')
        itinerary.endDesc = this.getDateDescription(itinerary.arrival);
        itinerary.endDesc += " at " + moment(itinerary.arrival).format('h:mm a');
        itinerary.travelTime = humanizeDuration(itinerary.duration * 1000,  { units: ["hours", "minutes"], round: true });
        itinerary.walkTimeDesc = humanizeDuration(itinerary.walk_time * 1000,  { units: ["hours", "minutes"], round: true });
        itinerary.dayAndDateDesc = moment(startTime).format('dddd, MMMM Do');
        itinerary.startTimeDesc = moment.parseZone(itinerary.wait_start || itinerary.departure).format('h:mm a');
        itinerary.endTimeDesc = itinerary.arrival ? moment(itinerary.arrival).format('h:mm a') : "Arrive";
        itinerary.arrivalDesc = itinerary.arrival ? itinerary.endTimeDesc : moment(itinerary.end_time).format('h:mm a');
        itinerary.distanceDesc = this.getDistanceDescription(itinerary.distance);
        itinerary.walkDistanceDesc = this.getDistanceDescription(itinerary.walk_distance);
      }

      this.setItineraryLegDescriptions = function(itinerary){
        itinerary.startDateDesc = this.getDateDescription(itinerary.startTime);
        itinerary.startTimeDesc = moment.parseZone(itinerary.startTime).format('h:mm a')
        itinerary.startDesc = itinerary.startDateDesc + " at " + itinerary.startTimeDesc;
        itinerary.endDateDesc = this.getDateDescription(itinerary.endTime);
        itinerary.endTimeDesc = moment(itinerary.endTime).format('h:mm a');
        itinerary.endDesc = itinerary.endDateDesc + " at " + itinerary.endTimeDesc;
        itinerary.travelTime = humanizeDuration(itinerary.duration * 1000,  { units: ["hours", "minutes"], round: true });
        itinerary.distanceDesc = this.getDistanceDescription(itinerary.distance);
        itinerary.dayAndDateDesc = moment(itinerary.startTime).format('dddd, MMMM Do');
      }

      this.setWalkingDescriptions = function(step){
        step.distanceDesc = this.getDistanceDescription(step.distance);
        step.arrow = 'straight';

        if(step.relativeDirection.indexOf('RIGHT') > -1){
          step.arrow = 'right';
        }else if(step.relativeDirection.indexOf('LEFT') > -1){
          step.arrow = 'left';
        }

        if(step.relativeDirection == 'DEPART'){
          step.description = 'Head ' + step.absoluteDirection.toLowerCase() + ' on ' + step.streetName;
        }else{
          step.description = this.capitalizeFirstLetter(step.relativeDirection) + ' on ' + step.streetName;
        }
        step.description = step.description.replace(/_/g,' ');
      }

      this.capitalizeFirstLetter = function(string) {
        return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase()
      }

      this.getAddressDescriptionFromLocation = function(location) {
        var description = {};
        if (location.poi) {
          description.line1 = location.poi.name
          description.line2 = location.formatted_address;
          if (description.line2.indexOf(description.line1) > -1) {
            description.line2 = description.line2.substr(description.line1.length + 2);
          }
        } else if (location.name) {
          description.line1 = location.name;
          description.line2 = location.formatted_address;
          if(description.line2 && description.line2.indexOf(description.line1) > -1){
            description.line2 = description.line2.substr(description.line1.length + 2);
          }
        } else {
          angular.forEach(location.address_components, function(address_component, index) {
            if(address_component.types.indexOf("street_address") > -1){
              description.line1 = address_component.long_name;
            }
          }, description.line1);
          description.line2 = location.formatted_address;
          if(description.line2.indexOf(description.line1) > -1){
            description.line2 = description.line2.substr(description.line1.length + 2);
          }
        }
        return description;
      }

      this.getDateDescription = function(date){
        if(!date)
          return null;
        var description;
        var now = moment().startOf('day');
        var then = moment(date).startOf('day');
        var dayDiff = now.diff(then, 'days');
        if(dayDiff == 0) {
          description = "Today";
        }else if (dayDiff == -1) {
          description = "Tomorrow";
        }else if (dayDiff == 1) {
          description = "Yesterday";
        }else{
          description = moment(date).format('dddd MMM DD, YYYY');
        }
        return description;
      }

      this.getCurrentBalance = function($scope, $http, ipCookie) {
        return $http.get(urlPrefix + 'api/v1/users/current_balance', this.getHeaders()).
          success(function(data) {
            if (data.current_balance != undefined){
              if($scope) $scope.currentBalance = data.current_balance;
              if(ipCookie) {ipCookie('currentBalance', data.current_balance);}
            }
          }).
          error(function(data) {
            console.log(data);
          });
      }

      this.getTripPurposes = function($scope, $http) {
        const that = this;
        // TODO: Look at this and see if it needs to be a post request
        return $http.post(urlPrefix + 'api/v1/trip_purposes/list', this.fromDetails, this.getHeaders()).
          success(function(data) {
            that.top_purposes = data.top_trip_purposes;
            data.trip_purposes = data.trip_purposes || [];
            that.purposes = data.trip_purposes.filter(function(el){
              for(let i = 0; i < that.top_purposes.length; i += 1){
                if(el.code && that.top_purposes[i].code === el.code){
                  return false;
                }
              }
              return true;
            });
            // NOTE(wilsonj806) Is this dead code?
            if (data.default_trip_purpose != undefined && $scope.email == undefined){
              $scope.default_trip_purpose = data.default_trip_purpose;
              $scope.showNext = true;
            }
          }).
          error(function(data) {
            alert(data);
          });
      }

      this.selectItineraries = function($http, itineraryObject) {
        return $http.post(urlPrefix + 'api/v1/itineraries/select', itineraryObject, this.getHeaders());
      }

      this.checkServiceArea = function($http, place) {
        return $http.post(urlPrefix + 'api/v1/places/within_area', place, this.getHeaders());
      }

      this.postItineraryRequest = function($http) {
        return $http.post(urlPrefix + 'api/v1/trips/', this.itineraryRequestObject, this.getHeaders());
      }

      this.postProfileUpdate = function($http) {
        return $http.post(urlPrefix + 'api/v1/users/update', this.profileUpdateObject, this.getHeaders());
      }

      this.getProfile = function($http) {
        return $http.get(urlPrefix + 'api/v1/users/profile', this.getHeaders());
      }

      this.getTravelPatterns = function($http, params={}) {
        let config = this.getHeaders();
        return $http.get(urlPrefix + '/api/v2/travel_patterns?' + $.param(params), config);
      }

      /**
       *** fixedRouteReminderPref format
      * @typedef {Object} NotificationPref
      *  @property {{reminders: Object[], disabled: boolean[]}} fixed_route
      */
      this.getUserNotificationDefaults = function($http) {
        const self = this
        var profilePromise = this.getProfile($http);
        return profilePromise.then(function(results){
          const avalable_reminders = results.data.details.notification_preferences.fixed_route
          const enabled = false
          const reminders = avalable_reminders.reduce(function(acc, curr) {
            acc[acc.length] = {'day': curr, enabled }
            return acc
          }, [])

          self.fixedRouteReminderPrefs = {
            reminders,
            disabled: self.buildDisableArray(reminders.length)
          }
        });
      }

      this.buildDisableArray = function(num) {
        const ar = []
        for (let i = 0; i < num; i++) {
          ar[i] = false
        }
        return ar
      }

      /**
      *** Function params
      * @param {NotificationPref} notificationPrefs
      * @param {Date} tripDate is the trip date represented as a Date instance
      *  - NOTE: this is a method param as planService.selectedTrip isn't necssarily
      *  ...defined on the plan details page
      * @returns {NotificationPref} returns a NotificationPref object that's synced
      * ...between the front end User preferences and the backend Trip preference
      */
      this.syncFixedRouteNotifications = function(notificationPrefs = null, tripDate = null) {
        // Using MomentJS for date parsing/ manipulation/ comparison
        const tripMoment = moment(tripDate).set({hour:0,minute:0,second:0})
        const today = moment().set({hour:0,minute:0,second:0})

        const fixedRoute = notificationPrefs !== null ? notificationPrefs.fixed_route : []
        const final = {
          reminders: [],
          disabled: {}
        }
        if (fixedRoute.length === 0) {
          final.reminders = this.fixedRouteReminderPrefs.reminders
          // Disable reminder preferences for reminder days that are in the past
          this.fixedRouteReminderPrefs.reminders.forEach(({day}) => {
            // if there's a tripDate fed in, then use that, otherwise, null
            const reminderDate = tripDate && tripMoment.clone().subtract(day,'day')

            // If the reminder date already passed then disable the checkbox
            const isNotInPast = reminderDate && reminderDate.isAfter(today)
            if (!isNotInPast) {
              final.disabled[day] = true
            } else {
              final.disabled[day] = false
            }
          })
        } else {
          this.fixedRouteReminderPrefs.reminders.forEach(({day, enabled}) => {
            // Finding Trip notification that matches the current user notification day
            const notif = fixedRoute.find(entry => entry.day === day)
            // if there's a tripDate fed in, then use that, otherwise, null
            const reminderDate = tripDate && tripMoment.clone().subtract(day,'day')

            // If the reminder date already passed then disable the checkbox
            const isNotInPast = reminderDate && reminderDate.isAfter(today)
            if (!isNotInPast) {
              final.disabled[day] = true
              final.reminders.push({day, enabled: notif.enabled})
            } else {
              final.reminders.push({day, enabled: notif.enabled})
              final.disabled[day] = false
            }
          })
        }

        return final
      }

      // Book a shared ride
      this.bookSharedRide = function($http) {
        var requestHolder = {};
        requestHolder.booking_request = [];
        var that = this;

        angular.forEach(this.paratransitItineraries, function(paratransitItinerary, index) {
          var bookingRequest = {};
          bookingRequest.itinerary_id = paratransitItinerary.id;

          if(that.hasEscort){
            bookingRequest.assistant = that.hasEscort;
          }

          if(that.numberOfFamily){
            bookingRequest.family = that.numberOfFamily;
          }

          if(that.numberOfCompanions){
            bookingRequest.companions = that.numberOfCompanions;
          }

          if(that.driverInstructions){
            bookingRequest.note = that.driverInstructions;
          }
          requestHolder.booking_request.push(bookingRequest);
        });

        this.booking_request = requestHolder;
        return $http.post(urlPrefix + 'api/v1/itineraries/book', requestHolder, this.getHeaders());
      }

      // Build an itinerary request object
      this.createItineraryRequest = function() {
        const ADMIN_AREA_3 = 'administrative_area_level_3';
        const PENN = 'Pennsylvania';
        let origin = this.fromDetails;
        let destination = this.toDetails;

        let request = {
          trips: [],
          // modes: ['paratransit', 'transit']
          modes: ['paratransit'],
          companions: this.numberOfCompanions,
          assistant: this.hasEscort
        };

        let outboundTrip = {
          trip: {
            arrive_by: true,
            trip_time: this.fromTime.toISOString(),
            external_purpose: this.purpose
          }
        };

        outboundTrip.trip.origin_attributes = {
          lat: origin.geometry.location.lat,
          lng: origin.geometry.location.lng,
          formatted_address: origin.formatted_address,
          google_place_attributes: origin
        };

        outboundTrip.trip.destination_attributes = {
          lat: destination.geometry.location.lat,
          lng: destination.geometry.location.lng,
          formatted_address: destination.formatted_address,
          google_place_attributes: destination
        };

        if (origin.poi) { outboundTrip.trip.origin_attributes.name = origin.poi.name; }
        if (origin.name) { outboundTrip.trip.origin_attributes.name = origin.name; }
        if (destination.poi) { outboundTrip.trip.destination_attributes.name = destination.poi.name; }
        if (destination.name) { outboundTrip.trip.destination_attributes.name = destination.name; }

        origin.address_components.forEach((component) => {
          component.types.forEach((type) => {
            if (type === 'postal_code') { type = 'zip'; }
            outboundTrip.trip.origin_attributes[type] = component.long_name;
          });
        });
        destination.address_components.forEach((component) => {
          component.types.forEach((type) => {
            if (type === 'postal_code') { type = 'zip'; }
            outboundTrip.trip.destination_attributes[type] = component.long_name;
          });
        });

        outboundTrip.trip.origin_attributes['city'] = outboundTrip.trip.origin_attributes['city'] || outboundTrip.trip.origin_attributes['locality'] || outboundTrip.trip.origin_attributes[ADMIN_AREA_3];
        if (outboundTrip.trip.origin_attributes['city'] === PENN) { delete outboundTrip.trip.origin_attributes['city']; }

        outboundTrip.trip.destination_attributes['city'] = outboundTrip.trip.destination_attributes['city'] || outboundTrip.trip.destination_attributes['locality'] || outboundTrip.trip.destination_attributes[ADMIN_AREA_3];
        if (outboundTrip.trip.destination_attributes['city'] === PENN) { delete outboundTrip.trip.destination_attributes['city']; }

        request.trips.push(outboundTrip)

        if (this.returnDate || this.returnTime) {
          let returnTrip = {
            trip: {
              origin_attributes: outboundTrip.trip.destination_attributes,
              destination_attributes: outboundTrip.trip.origin_attributes,
              trip_time: this.returnTime.toISOString(),
              arrive_by: false,
              external_purpose: this.purpose
            }
          };

          request.trips.push(returnTrip);
        }

        return request;
      };

      this.updateTripDetails = function($http, updateTripRequest) {
        return $http.put(urlPrefix + 'api/v1/itineraries/update_trip_details', updateTripRequest , this.getHeaders());
      }

      /**
       * Add city to the location object if a 'locality' type address component doesn't exist
       * @param {*} location : A location returned by the Google Place API
       */
      this.addCityToLocation = function(location) {
        const ADMIN_AREA_3 = 'administrative_area_level_3'
        let cityAddressComponent;
        const localityAvailable = location.address_components.find(function(component) {
          return component.types.includes('locality') && (component.long_name !== null && component.long_name !== "")
        })

        if (!localityAvailable) {
          // pull administrative locality level 3 instead if locality isn't present
          cityAddressComponent = location.address_components.find(function(component) {
            const includesAdmin3 = component.types.includes(ADMIN_AREA_3);
            return includesAdmin3 && component.long_name !== 'Pennsylvania' && (component.long_name !== null && component.long_name !== "")
          })

          if (!cityAddressComponent || cityAddressComponent.long_name === null || cityAddressComponent.long_name === "") {
            throw new Error(`The "${location.name}" address does not have a city. Please search again for an address with the city included.`)
          }
          // Waypoint locality is interpreted as the city in OCC
          // Build new locality object with proper types
          // Correct the city if it's incorrect according to the utility service(see PAMF-751 for the reasoning)
          const localityObject = {
            long_name: util.silentlyCorrectIncorrectTownship(cityAddressComponent.long_name),
            short_name: util.silentlyCorrectIncorrectTownship(cityAddressComponent.long_name),
            types: ['locality', 'political']
          }
          location.address_components.push(localityObject)
        }
      }

      this.fixLatLon = function(place) {
        if (place && place.geometry && place.geometry.location) {
          let location = place.geometry.location

          if (location.lat && typeof location.lat !== 'number') {
            location.lat = location.lat();
          }
          if (location.lng && typeof location.lng !== 'number') {
            location.lng = location.lng();
          }
        }
      }

      this.getHeaders = function(){
        //return empty object if no email
        if(!this.email){ return {}; }
        var headers = {headers:  {
          "X-User-Email" : this.email,
          "X-User-Token" : this.authentication_token}
        };
        return headers;
      }

      // Returns true if itinerary is live
      this.itinIsLive = function(i) {
        return (i.status == "dispatch" || i.status == "active");
      }

      // Returns true if a trip is live
      this.tripIsLive = function(trip) {
        if(!trip) {return false;} // Return false if no trip is passed
        var planService = this;
        //var isSoon = planService.tripEta(trip, true) <= 180; // Is it arriving in less than 3 hours?
        var isSharedRide = trip.mode == "mode_paratransit";
        return trip.itineraries.some( function(i) {
          var isOnItsWay = planService.itinIsLive(i); // Is the trip on its way?
          return isSharedRide && isOnItsWay //&& isSoon;
        });
      }

      // Finds an Live Trip from a list of Trips, or returns undefined if not there
      this.findLiveTrip = function(trips) {
        var planService = this;
        return trips.find(function(trip) {
          return planService.tripIsLive(trip);
        });
      }

      // Returns the first itinerary that isn't past
      this.getLiveItinerary = function(trip) {
        var planService = this;
        return trip.itineraries.find(function(i) {
          return planService.itinIsLive(i);
        });
      }

      // returns eta of trip based on estimated pickup time, in minutes
      this.tripEta = function(trip, raw) {
        var planService = this;
        var pickup_time = new Date(planService.getLiveItinerary(trip).estimated_pickup_time + "Z"); // Have to append Z to the end of the time string to get the same results in Chrome and Firefox
        pickup_time = moment(pickup_time).add(pickup_time.getTimezoneOffset(), 'minutes');
        if(isNaN(pickup_time)) {return false;}
        var eta = (Math.floor(moment.duration(pickup_time - Date.now()).asMinutes()));
        if(raw) {
          return eta;
        } else if(eta < 10) {
          return "a few minutes";
        } else {
          return "about " + $filter('minutes')(eta);
        }
      }

      // returns true/false if ride is arrived
      this.tripIsHere = function(trip) {
        var planService = this;
        var isLive = planService.tripIsLive(trip);
        if(!trip) {return false;} // Return false if no trip is passed
        return trip.itineraries.some( function(i) {
          // return moment(Date.now()).minutes() % 2 == 0;
          return !!i.actual_pickup_time && isLive;
        });
      }

      // Updates Live Trip info in the necessary places
      this.updateLiveTrip = function(trip) {
        var planService = this;
        if(trip) {
          planService.selectedTrip = trip; // Find Live Trip and Select it
          trip.isLive = true;  // Set the liveTrip value in the appropriate trip
          trip.eta = planService.tripEta(trip); // Update Estimated Arrival Time
          trip.isHere = planService.tripIsHere(trip); // Is ride actually there?
        }
      }

      // Process Future Trips Data and Updates Live Trip info. Returns Live Trip if it exists.
      this.processFutureAndLiveTrips = function(data, $scope, ipCookie) {
        var planService = this;
        var unpackedTrips = planService.unpackTrips(data.data.trips, 'future');
        planService.populateScopeWithTripsData($scope, unpackedTrips, 'future');
        ipCookie('rideCount', unpackedTrips.length);

        var liveTrip = (planService.tripIsLive($scope.trip) && $scope.trip) || (!!$scope.trips && planService.findLiveTrip($scope.trips.future));
        planService.updateLiveTrip(liveTrip);
        if($scope) {$scope.liveTrip = liveTrip || null;} // Set $scope variable to liveTrip
        if(ipCookie) {ipCookie('liveTrip', !!liveTrip);} // Set cookie to store liveTrip or lack thereof

        return liveTrip;
      }

      // Creates an eta checker object
      this.createEtaChecker = function($scope, $http, ipCookie) {
        var planService = this;

        // Stop the checker if it already exists.
        planService.killEtaChecker();

        // Set etaChecker to a new object with the appropriate scope and dependencies.
        planService.etaChecker = {
          // planService: this,
          intervalSeconds: 60,
          count: 120,
          start: function(checkFunction) {
            this.timer = $interval(function() {
              planService.getFutureRides($http).then(function(data) {
                var liveTrip =
                planService.processFutureAndLiveTrips(data, $scope, ipCookie);
                !liveTrip && planService.killEtaChecker();
              });
            }, this.intervalSeconds * 1000, this.count);
          },
          stop: function() {
            $interval.cancel(this.timer);
          }
        }
        // Start the checker.
        planService.etaChecker.start();
      }

      this.killEtaChecker = function () {
        var planService = this;
        if (planService.etaChecker) {
          planService.etaChecker.stop();
          planService.etaChecker = undefined;
        }
      }
    }
  ]
);

angular.module('applyMyRideApp')
  .service('LocationSearch', function($http, $q, localStorageService, $filter){
    var countryFilter = $filter('noCountry');
    var urlPrefix = '//' + APIHOST + '/';

    var autocompleteService = new google.maps.places.AutocompleteService();

    var LocationSearch = new Object();
    var compositePromise = false;
    LocationSearch.getLocations = function(text, config, includeRecentSearches) {

      // setup compositePromise deferred object. but first, if compositePromise isn't false, reject the old promise
      if(compositePromise !== false){
        compositePromise.reject();
      }
      compositePromise = $q.defer();

      // setup all the individual promises that result in compositePromise resolving
      var promises = [
          LocationSearch.getGooglePlaces(text),
          LocationSearch.getSavedPlaces(text, config)
        ];

      // add the getRecentSearches if they are to be included
      //if(includeRecentSearches == true){
      //  promises.push(LocationSearch.getRecentSearches(text) );
      //}

      // when all the promises are resolved, then resolve the compositePromise
      $q.all(promises).then(function(results){
        if(compositePromise !== false){
          compositePromise.resolve(results);
        }
      });

      // reset compositePromise to false when its promise is finished
      compositePromise.promise.then(function(){
        compositePromise = false;
      }).catch(function(){
        compositePromise = false;
      });

      // compositePromise triggers when promises are finished
      return compositePromise.promise;
    }

    LocationSearch.getGooglePlaces = function(text) {
      var googlePlaceData = $q.defer();
      this.placeIds = [];
      this.results = [];
      var that = this;
      autocompleteService.getPlacePredictions(
        {
          input: text,
          bounds: new google.maps.LatLngBounds(
                    // ALL PA
                    new google.maps.LatLng(39.719799, -80.519895),
                    new google.maps.LatLng(42.273734, -74.689502)
                  ),
          strictBounds: true
        }, function(list, status) {
          angular.forEach(list, function(value, index) {
            var formatted_address;
            //verify the location has a street address
            if( (that.results.length < 10) &&
                value.terms.some(function(t) {
                  return t.value === "PA";
                }) && // Filter out anything not in PA
                ( (value.types.indexOf('route') > -1) ||
                  (value.types.indexOf('establishment') > -1) ||
                  (value.types.indexOf('street_address') > -1) ||
                  (value.types.indexOf('premise') > -1) ) ) {
              formatted_address = countryFilter( value.description );
              that.results.push(formatted_address);
              that.placeIds.push(value.place_id);
            }
          });
          googlePlaceData.resolve({googleplaces:that.results, placeIds: that.placeIds});
        });
      return googlePlaceData.promise
    }

    LocationSearch.getRecentSearches = function(text) {

      var recentSearchData = $q.defer();
      var recentSearches = localStorageService.get('recentSearches');
      if(!recentSearches){
        recentSearchData.resolve({recentsearches: [], placeIds: []});
      }else{
        this.recentSearchResults = [];
        this.recentSearchPlaceIds = [];
        var that = this;
        angular.forEach(Object.keys(recentSearches), function(key, index) {
          if(that.recentSearchResults.length < 10 && key.toLowerCase().indexOf(text.toLowerCase()) > -1 && that.recentSearchResults.indexOf(key) < 0){
            var location = recentSearches[key];
            that.recentSearchResults.push( countryFilter( key ) );
            that.recentSearchPlaceIds.push(location.place_id)
          }
        });
        recentSearchData.resolve({recentsearches: that.recentSearchResults, placeIds: that.recentSearchPlaceIds});
      }
      return recentSearchData.promise;
    }

    LocationSearch.getSavedPlaces = function(text, config) {
      var savedPlaceData = $q.defer();
      this.savedPlaceIds = [];
      this.savedPlaceAddresses = [];
      this.savedPlaceResults = [];
      this.poiData = [];
      var that = this;
      $http.get(urlPrefix + 'api/v1/places/search?include_user_pois=true&search_string=%25' + text + '%25', config).
        success(function(data) {
          var locations = data.places_search_results.locations;
          var filter = /[^a-zA-Z0-9]/g;
          angular.forEach(locations, function(value, index) {
            var address;
            if(that.savedPlaceResults.length < 10){
              //use the formatted_address if the name is basically the same
              //compare by:
              // 1) Only looking at the name address up to the first column.
              // 2) going to upper case
              // 3) stripping non-alpha-numeric characters
              // 4) Replace Directions (NORTH/SOUTH/EAST/WEST) with (N/S/E/W)
              // 5) Replace Common Street Suffixes with Abbr. (ROAD/DRIVE/STREET) to (RD/DR/ST). This one might need to be extended from time to time
              // 6) Only look at the first 10 characters.  This reduces the likelihood that a street abbreviation comes into play.
              var normalizedName = value.name.split(',')[0].toUpperCase().replace(filter, '').replace('NORTH', 'N').replace('SOUTH', 'S').replace('EAST','E').replace('WEST','W').replace('DRIVE','DR').replace('ROAD','RD').replace('STREET','ST').substring(0,10);
              var normalizedAddress = value.formatted_address.split(',')[0].toUpperCase().replace(filter, '').replace('NORTH', 'N').replace('SOUTH', 'S').replace('EAST','E').replace('WEST','W').replace('DRIVE','DR').replace('ROAD','RD').replace('STREET','ST').substring(0,10);
              if(normalizedAddress === normalizedName){
                //they're the same, just show one.
                address = 'POI ' + value.formatted_address;
              }else{
                //they're different. show both
                address = 'POI ' + value.name + ', ' + value.formatted_address;
              }
              that.savedPlaceResults.push(address);
              that.savedPlaceAddresses.push(value.formatted_address);
              that.savedPlaceIds.push(value.place_id);
              that.poiData.push(value);
            }
          });
          savedPlaceData.resolve({savedplaces:that.savedPlaceResults, placeIds: that.savedPlaceIds, savedplaceaddresses: that.savedPlaceAddresses, poiData: that.poiData});
        });
      return savedPlaceData.promise;
    }

    return LocationSearch;
  });

;
'use strict';


angular.module('applyMyRideApp')
  .service('util', ['$http', function($http) {

	this.isMobile = function(){
  		return /Mobi/.test(navigator.userAgent);
		}

	this.assignDefaultValueIfEmpty = function(arg, val) {
		return typeof arg !== 'undefined' ? arg : val;
	}

  // Makes an HTTP request for county names, and calls callback functions.
  this.getCounties = function(successCallback, errorCallback) {
    $http({
      method: 'GET',
      url: '//'+ APIHOST + '/api/v1/services/ids_humanized'
    }).then(successCallback, errorCallback);
  }

  this.dateISOSortComparer = function(isoA,isoB, earlierFirst)
  {
    var da = new Date(isoA);
    var db = new Date(isoB);
    if (isNaN(da) || isNaN(db))
      return 0;
    var ta = da.getTime();
    var tb = db.getTime();
    var comp = tb - ta;
    if (earlierFirst) comp *= -1;
    return comp;
  };

  /** See [PAMF-751]
   * method returns a corrected city based on the input city and whether or not it exists in the below object
   * - Should match with the CORRECTED_CITY_HASHES constant in the Trip model of the OCC repo
   */
  this.silentlyCorrectIncorrectTownship = function(city='') {
    const BadCities = {
      'West Manchester Township': 'York',
      'West Manchester Twp': 'York',
      'Hampden Township': 'Mechanicsburg',
      'Hampden Twp': 'Mechanicsburg',
    }
    return BadCities[city] == null ? city : BadCities[city]
  }

    // see [PAMF-698]
    this.getCountiesInTransition = function (successCallback, errorCallback) {
      //simulate back-end response
      var response = { counties: ['Northumberland', 'Union', 'Snyder', 'Montour', 'Columbia'] };
      // Return an emtpy array to disable display of the transition messages.
      // var response = { };
      successCallback(response);
    };

    // see [PAMF-698]
    this.getTransitionMessages = function (successCallback, errorCallback) {
      var response = {
        countyInTransitionMessage:
          'FindMyRide is unavailable for maintenance through July 1, 2023. To schedule or cancel your trip, please call Customer Service at 1-800-632-9063. As part of the scheduled maintenance, some riders may be assigned a new Shared Ride ID number.  On July 1st or after, if your ID number is not working to log in, use the Forgot your ID feature in the FindMyRide login section or call Customer Service.',
        helpMessage:
          'Please call Customer Service at 1-800-632-9063 to schedule your trip.'
      };
      successCallback(response);
    };

}]);


// Default callbacks log array on success, log error message on fail.
// successCallback = function(r) {
//   return r.data.service_ids;
// },
// errorCallback = function(e) {
//   console.log(e);
// }

;
var app = angular.module('applyMyRideApp');

app.factory('debounce', ['$timeout', '$q', function($timeout, $q) {
  /**
   * Angular JS Debounce factory
   * - only exists to debounce function calls so we can't spam a button over and over
   * - taken from this StackOverflow post: https://stackoverflow.com/questions/13320015/how-to-write-a-debounce-service-in-angularjs
   *
   * @param {Function} func - the input function to be debounced
   * @param {number} wait - wait time before executing the function in milliseconds
   * @param {Boolean} immediate - run the input function immediately?
   */
  return function debounce(func, wait, immediate) {
    let timeout
    // Create a deferred object that will be resolved when we need to
    // ... actually call the function
    // The Deferred object represents a task to be finished in the future
    let deferred = $q.defer() // $q is a service that lets your run functions asynchronously
    return function() {
      let context = this
      let args = arguments;
      const later = function() {
        timeout = null;
        if(!immediate) {
          deferred.resolve(func.apply(context, args));
          deferred = $q.defer();
        }
      };
      const callNow = immediate && !timeout;
      if ( timeout ) {
        $timeout.cancel(timeout);
      }
      timeout = $timeout(later, wait);
      if (callNow) {
        deferred.resolve(func.apply(context,args));
        deferred = $q.defer();
      }
      return deferred.promise;
    };
  }
}])
;
'use strict';

var app = angular.module('applyMyRideApp');

app.directive('datepickerPopup', ['uibDatepickerPopupConfig', 'uibDateParser', 'dateFilter', function (datepickerPopupConfig, dateParser, dateFilter) {
  return {
    'restrict': 'A',
    'require': '^ngModel',
    'link': function ($scope, element, attrs, ngModel) {
      var dateFormat;

      //*** Temp fix for Angular 1.3 support [#2659](https://github.com/angular-ui/bootstrap/issues/2659)
      attrs.$observe('datepickerPopup', function(value) {
        dateFormat = value || datepickerPopupConfig.datepickerPopup;
        ngModel.$render();
      });

      ngModel.$formatters.push(function (value) {
        return ngModel.$isEmpty(value) ? value : dateFilter(value, dateFormat);
      });
    }
  };
}]);

app.directive('csCalendar', function() {

    function _removeTime(date) {
        return date.hour(0).minute(0).second(0).millisecond(0);
    }

    function _buildMonth(scope, start, month) {
        scope.weeks = [];
        var done = false, date = start.clone(), monthIndex = date.month(), count = 0;
        while (!done) {
            scope.weeks.push({ days: _buildWeek(date.clone(), month) });
            date.add(1, 'w');
            done = count++ > 2 && monthIndex !== date.month();
            monthIndex = date.month();
        }
    }

    function _buildWeek(date, month) {
        var days = [];
        for (var i = 0; i < 7; i++) {
            days.push({
                name: date.format('dd').substring(0, 1),
                number: date.date(),
                isCurrentMonth: date.month() === month.month(),
                isToday: date.isSame(new Date(), 'day'),
                date: date
            });
            date = date.clone();
            date.add(1, 'd');
        }
        return days;
    }

    return {
        templateUrl: '/views/calendar.html',
        restrict: 'E',
        scope: {
            date: '=sdate'
        },
        link: function(scope) {
            scope.date = _removeTime(scope.date || moment());
            scope.month = scope.date.clone();

            var start = scope.date.clone();
            start.date(1);
            _removeTime(start.day(0));

            _buildMonth(scope, start, scope.month);

            scope.select = function(day) {
                scope.date = day.date;
            };

            scope.next = function() {
                var next = scope.month.clone();
                _removeTime(next.month(next.month()+1).date(1));
                scope.month.month(scope.month.month()+1);
                _buildMonth(scope, next, scope.month);
            };

            scope.previous = function() {
                var previous = scope.month.clone();
                _removeTime(previous.month(previous.month()-1).date(1));
                scope.month.month(scope.month.month()-1);
                _buildMonth(scope, previous, scope.month);
            };
        }
    };

});

;
'use strict';

var app = angular.module('applyMyRideApp');

app.directive('csTime', function() {

    return {
        templateUrl: '/views/time-grid.html',
        restrict: 'E',
        scope: {
            selected: '=stime'
        },
        link: function(scope) {
            scope.times = [
                {display: '1:00', isSelected: false},
                {display: '1:30', isSelected: true},
                {display: '2:00', isSelected: false},
                {display: '2:30', isSelected: false},
                {display: '3:00', isSelected: false},
                {display: '3:30', isSelected: false},
                {display: '4:00', isSelected: false},
                {display: '4:30', isSelected: false},
                {display: '5:00', isSelected: false},
                {display: '5:30', isSelected: false},
                {display: '6:00', isSelected: false},
                {display: '6:30', isSelected: false},
                {display: '7:00', isSelected: false},
                {display: '7:30', isSelected: false},
                {display: '8:00', isSelected: false},
                {display: '8:30', isSelected: false},
                {display: '9:00', isSelected: false},
                {display: '9:30', isSelected: false},
                {display: '10:00', isSelected: false},
                {display: '10:30', isSelected: false},
                {display: '11:00', isSelected: false},
                {display: '11:30', isSelected: false},
                {display: '12:00', isSelected: false},
                {display: '12:30', isSelected: false}
            ];

            scope.meridians = [
                {display: 'am', isSelected: false},
                {display: 'pm', isSelected: true},
            ];

            scope.timeSelected = scope.times[1];
            scope.merSelected = scope.meridians[1];

            scope.selected = scope.timeSelected.display + ' ' + scope.merSelected.display;

            scope.select = function(time) {
                scope.timeSelected = time;
                scope.selected = scope.timeSelected.display + ' ' + scope.merSelected.display;
                scope.times.forEach(function(entry) {
                    entry.isSelected = false;
                });
                time.isSelected = true;
            };

            scope.selectMeridian = function(mer) {
                scope.merSelected = mer;
                scope.selected = scope.timeSelected.display + ' ' + scope.merSelected.display;
                scope.meridians.forEach(function(entry) {
                    entry.isSelected = false;
                });
                mer.isSelected = true;
            };

        }
    };
    
});

;
'use strict';

var app = angular.module('applyMyRideApp');

app.directive('clickFocus', function($window) {
  return {
    restrict: 'AC',
    link: function(_scope, _element) {
      _element.on("click", function(){
        if (!$window.getSelection().toString()) {
          this.setSelectionRange(0, this.value.length)
        }
      });
    }
  };
});

;
'use strict';

var app = angular.module('applyMyRideApp');

app.directive('csTimeInput', function() {
    var unwatch=false;
    return {
        restrict: "E",
        templateUrl: "views/cs-time-input.html",
        link: function(scope, element, attrs){

            if( scope.$parent.fromMoment.isAfter() ){
                var fromMoment = scope.$parent.fromMoment;
                scope.hour = fromMoment.format('h');
                scope.minute = fromMoment.format('m');
                scope.isAM = ('am' == fromMoment.format('a'));
                scope.rideTime = { value: fromMoment.toDate() };
                scope.inputFocused = true;
            }else{
                scope.hour = '';
                scope.minute = '';
                scope.rideTime = {};
                scope.isAM = true;
                scope.inputFocused = false;
            }
            scope.isMobile = scope.$parent.isMobile;
            var lastVal = {hour: scope.hour, minute: scope.minute};

            //update the displayed time when from Moment updates
            scope.$parent.$watch('fromMoment', function( newStartTime ){
                if(!scope.inputFocused || unwatch || !newStartTime || !newStartTime._isAMomentObject || !newStartTime.isAfter() ){ unwatch=false; return; }
                //setup the local vars when fromMoment changes
                scope.hour = newStartTime.format('h');
                scope.minute = newStartTime.format('mm');
                scope.isAM = ('am' === newStartTime.format('a'));
                var newTime = newStartTime.toDate();
                newTime.setMilliseconds(0);
                newTime.setSeconds(0);
                scope.rideTime.value = newTime;
            });
            //mobile interface uses native time input
            //when that value updates, update the fromMoment
            scope.$watch(function(){return scope.rideTime.value;}, function(n){
              if(scope.rideTime.value && scope.rideTime.value instanceof Date){
                var fromTime = scope.$parent.fromMoment.toDate();
                fromTime.setHours( scope.rideTime.value.getHours() );
                fromTime.setMinutes( scope.rideTime.value.getMinutes() );
                fromTime.setMilliseconds(0);
                fromTime.setSeconds(0);
                unwatch = true;
                var newFromMoment = moment(fromTime);
                setTimeout(function(){unwatch = false;}, 200);
                scope.$parent.fromMoment = newFromMoment;
                scope.$parent.fromTimeUpdated = true;
              }else{
                scope.$parent.fromTimeUpdated = false;
              }
            });
            function validHour(){
                var hour = parseInt(scope.hour);
                //ok if hour is '', or between 1 and 12. reset if out of range
                if(scope.hour == ''){
                    return false;
                }
                if(hour < 1 || hour > 12 || isNaN(hour) ){
                    scope.hour = lastVal.hour;
                    return false;
                }
                scope.hour = ''+hour;
                return true;
            }
            function validMinute(){
                var minute = parseInt(scope.minute);
                //ok if minute is '', or between 0 and 59. reset if out of range
                if(scope.minute == ''){
                    return false;
                }
                if(minute < 0 || minute > 59 || isNaN(minute) ){
                    scope.minute = lastVal.minute;
                    return false;
                }
                scope.minute = '' + scope.minute;
                //handle leading zeros
                if( scope.minute.substr(0,1) == '0' && scope.minute.length > 1){
                    if(scope.minute == '00'){ return true; }
                    scope.minute = '0'+minute;
                    return true;
                }
                scope.minute = ''+minute;
                return true;
            }

            scope.blurMinute = function(){
              //if scope.minute is blank, set to '00' and update the time
              if(!scope.minute){
                  scope.minute = '00';
                  scope.updateTime('minute')
              }
            }
            scope.updateTime = function(updatingElement) {
                var from, hour, minute;
                //validate the time
                if(updatingElement === 'hour'){
                    if( !validHour() ){
                        scope.$parent.fromTimeUpdated = false;
                        return;
                    }
                }
                else if(updatingElement === 'minute'){
                    if( !validMinute() ){
                        return;
                    }
                }
                else if(updatingElement === 'ampm'){
                    //nothing
                }

                from = scope.$parent.fromMoment.clone();
                hour = parseInt(scope.hour);
                minute = parseInt(scope.minute || 0 );

                //if it's 12AM, set hour to 0. If it's PM, add 12 to hour (unless it's 12PM, then do nothing)
                if(true === scope.isAM){
                    if(hour == 12){
                        hour = 0;
                    }
                }else{
                    if(hour != 12){
                        hour += 12;
                    }
                }

                //finally, update the time
                from.hour(hour).minute(minute);
                if(hour > -1 && minute > -1){
                    //flag for above fromMoment watch to ignore this value change
                    unwatch = true;
                    setTimeout(function(){unwatch = false;}, 200);
                    scope.$parent.fromMoment = from;
                    //flag parent scope for validation purposes, if we updated the hour
                    scope.$parent.fromTimeUpdated = validHour() && validMinute();
                }else{
                    scope.$parent.fromTimeUpdated = false;
                }

                // if the hour was updated, and the number is greater than 1, focus on the minute input
                if(updatingElement === 'hour' && scope.hour > 1){
                    setTimeout(function(){
                        $('.cs-time-input input.cs-minute').focus();
                        $('.cs-time-input input.cs-minute').click();
                    }, 1);
                }
            }

            element[0].addEventListener("keydown", function(e)
            {
                var lvIndex = e.srcElement.classList.contains('cs-hour') ? 'hour' : 'minute';
                lastVal[lvIndex] = e.srcElement.value;
            });

        }
    };
});

;
/* --- Made by justgoscha and licensed under MIT license --- */

var app = angular.module('autocomplete', []);

app.directive('autocomplete', function() {
  var index = -1;
  var wasTyped = false;

  return {
    restrict: 'E',
    scope: {
      searchParam: '=ngModel',
      suggestions: '=data',
      onType: '=onType',
      onSelect: '=onSelect',
      onBlur: '=onBlur',
      onFocus: '=onFocus',
      autocompleteRequired: '=',
      disableFilter: '=disableFilter'
    },
    controller: ['$scope', function($scope){
      // the index of the suggestions that's currently selected
      $scope.selectedIndex = -1;

      $scope.initLock = true;

      // set new index
      $scope.setIndex = function(i){
        $scope.selectedIndex = parseInt(i);
      };

      this.setIndex = function(i){
        $scope.setIndex(i);
        $scope.$apply();
      };

      $scope.getIndex = function(i){
        return $scope.selectedIndex;
      };

      // watches if the parameter filter should be changed
      var watching = true;

      // autocompleting drop down on/off
      $scope.completing = false;

      // starts autocompleting on typing in something
      $scope.$watch('searchParam', function(newValue, oldValue){

        if(newValue == ''){
          $scope.select();
          $scope.setIndex(-1);
        }

        if (oldValue === newValue || (!oldValue && $scope.initLock)) {
          return;
        }

        if(watching && typeof $scope.searchParam !== 'undefined' && $scope.searchParam !== null) {
          $scope.completing = true;
          $scope.searchFilter = $scope.disableFilter ? '' : $scope.searchParam;
          $scope.selectedIndex = -1;
        }

        // function thats passed to on-type attribute gets executed
        if($scope.onType && wasTyped){
          $scope.onType($scope.searchParam);
        }
        wasTyped = false;
      });

      // for hovering over suggestions
      this.preSelect = function(suggestion){

        watching = false;

        // this line determines if it is shown
        // in the input field before it's selected:
        //$scope.searchParam = suggestion;

        $scope.$apply();
        watching = true;

      };

      $scope.preSelect = this.preSelect;

      this.preSelectOff = function(){
        watching = true;
      };

      $scope.preSelectOff = this.preSelectOff;

      // selecting a suggestion with RIGHT ARROW or ENTER
      $scope.select = function(suggestion){
        if(suggestion){
          $scope.searchParam = suggestion;
          $scope.searchFilter = suggestion;
          if($scope.onSelect)
            $scope.onSelect(suggestion);
        }
        $scope.blurWait = false;
        watching = false;
        $scope.completing = false;
        setTimeout(function(){watching = true;},1000);
        $scope.setIndex(-1);
      };
      $scope.ignoreBlur = function(){
        $scope.blurWait = true;
      }


    }],
    link: function(scope, element, attrs){

      setTimeout(function() {
        scope.initLock = false;
        scope.$apply();
      }, 250);

      var attr = '';

      // Default atts
      scope.attrs = {
        "placeholder": "start typing...",
        "class": "",
        "id": "",
        "inputclass": "",
        "inputid": ""
      };

      for (var a in attrs) {
        attr = a.replace('attr', '').toLowerCase();
        // add attribute overriding defaults
        // and preventing duplication
        if (a.indexOf('attr') === 0) {
          scope.attrs[attr] = attrs[a];
        }
      }

      if (attrs.clickActivation) {
        element[0].onclick = function(e){
          if(!scope.searchParam){
            setTimeout(function() {
              scope.completing = true;
              scope.$apply();
            }, 200);
          }
        };
      }

      var key = {left: 37, up: 38, right: 39, down: 40 , enter: 13, esc: 27, tab: 9};

      element[0].addEventListener("keydown", function(e){
        var keycode = e.keyCode || e.which;
        var l = angular.element(this).find('li').length;

        // this allows submitting forms by pressing Enter in the autocompleted field
        //if(!scope.completing || l == 0) return;

        // implementation of the up and down movement in the list of suggestions
        switch (keycode){
          case key.up:

            index = scope.getIndex()-1;

            if(index<-1){
              index = l-1;
            } else if (index >= l ){
              index = -1;
              scope.setIndex(index);
              scope.preSelectOff();
              break;
            }
            if(!scope.suggestions[index].option){
                index--;
            }

            scope.setIndex(index);

            if(index!==-1)
              scope.preSelect(angular.element(angular.element(this).find('li')[index]).text());

            scope.$apply();

            break;
          case key.down:
            index = scope.getIndex()+1;
            if(index<-1){
              index = l-1;
            } else if (index >= l ){
              index = -1;
              scope.setIndex(index);
              scope.preSelectOff();
              scope.$apply();
              break;
            }
            if(!scope.suggestions[index].option){
              index++;
            }
            scope.setIndex(index);

            if(index!==-1)
              scope.preSelect(angular.element(angular.element(this).find('li')[index]).text());

            break;
          case key.left:
            break;
          case key.right:
          case key.enter:
          case key.tab:

            index = scope.getIndex();
            // scope.preSelectOff();
            if(index !== -1) {
              scope.select(angular.element(angular.element(this).find('li')[index]).text());
              if(keycode == key.enter) {
                e.preventDefault();
              }
            } else {
              if(keycode == key.enter) {
                scope.select();
              }
            }
            scope.setIndex(-1);
            scope.$apply();

            break;
          case key.esc:
            // disable suggestions on escape
            scope.select();
            scope.setIndex(-1);
            scope.$apply();
            e.preventDefault();
            break;
          default:
            wasTyped = true;
            return;
        }
      }, true)

      element[0].addEventListener("blur", function(e){
        //run callback provided in view if the event target is this input's id
        if(scope.onBlur && e.target.id === scope.attrs.inputid){
          scope.onBlur( scope.searchParam );
        }
        // disable suggestions on blur
        // we do a timeout to prevent hiding it before a click event is registered
        setTimeout(function() {
          if(scope.blurWait == true){return;}
          scope.select();
          scope.setIndex(-1);
          scope.$apply();
        }, 750);

      }, true);

      element[0].addEventListener("focus", function (e){
        if(scope.onFocus){
          scope.onFocus(e, scope);
        }
      }, true);

    },
    template: '\
        <div class="autocomplete {{ attrs.class }}" id="{{ attrs.id }}">\
          <input\
            type="text"\
            click-to-focus="{{ attrs.clicktofocus }}"\
            focus-me="{{ attrs.autofocus }}"\
            ng-model="searchParam"\
            placeholder="{{ attrs.placeholder }}"\
            class="clearable {{ attrs.inputclass }}"\
            id="{{ attrs.inputid }}"\
            autocomplete="off"\
            ng-model-options="{ debounce: 100 }"\
            ng-required="{{ autocompleteRequired }}" />\
          <ul ng-show="completing && (suggestions | filter:searchFilter).length > 0">\
            <li\
              suggestion\
              ng-repeat="suggestion in suggestions"\
              index="{{ $index }}"\
              val="{{ suggestion.label }}"\
              ng-class="{ active: ($index === selectedIndex && suggestion.option), selectable: (suggestion.option) }"\
              ng-click="!suggestion.option || select(suggestion.label)"\
              ng-mousedown="ignoreBlur()"\
              ng-bind-html="suggestion.label"></li>\
          </ul>\
        </div>'
  };
});

app.directive('clickToFocus', 
  ['$window', function ($window) {
      return {
        link: function(scope, element) {
            element.on('click', function () {
                if (!$window.getSelection().toString()) {
                    // Required for mobile Safari
                    this.setSelectionRange(0, this.value.length)
                }
            });
        }
      };
  }]
);
app.directive('focusMe', function($timeout) {
  return {
    scope: { trigger: '@focusMe' },
    link: function(scope, element) {
      scope.$watch('trigger', function(value) {
        if(value === "true") { 
          $timeout(function() {
            element[0].focus(); 
          });
        }
      });
    }
  };
});
app.filter('highlight', ['$sce', function ($sce) {
  return function (input, searchParam) {
    if (typeof input === 'function') return '';
    if (searchParam) {
      var words = '(' +
            searchParam.split(/\ /).join(' |') + '|' +
            searchParam.split(/\ /).join('|') +
          ')',
          exp = new RegExp(words, 'gi');
      if (words.length) {
        input = input.replace(exp, "<span class=\"highlight\">$1</span>");
      }
    }
    return $sce.trustAsHtml(input);
  };
}]);

app.directive('suggestion', function(){
  return {
    restrict: 'A',
    require: '^autocomplete', // ^look for controller on parents element
    link: function(scope, element, attrs, autoCtrl){
      element.bind('mouseenter', function() {
        autoCtrl.preSelect(attrs.val);
        autoCtrl.setIndex(attrs.index);
      });

      element.bind('mouseleave', function() {
        autoCtrl.preSelectOff();
      });
    }
  };
});

;
'use strict';

var app = angular.module('applyMyRideApp');


app.directive('ngEnter', function () {
  return function (scope, element, attrs) {
    element.bind("keydown keypress", function (event) {
      if(event.which === 13) {
        scope.$eval(attrs.ngEnter);
        /*scope.$apply(function (){
          scope.$eval(attrs.ngEnter);
        });*/

        event.preventDefault();
      }
    });
  };
});

;
'use strict';

var app = angular.module('applyMyRideApp');

app.directive('focus', function($timeout) {
  return {
    restrict: 'AC',
    link: function(_scope, _element) {
      $timeout(function(){
        _element[0].focus();
      }, 0);
    }
  };
});