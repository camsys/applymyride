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
      };
      var currentPath = $location.path();
      var currentStep = currentPath.split('/').pop();
      var title = titleMap[currentStep] || "FMR Schedule";
      document.title = title;
    });
  });