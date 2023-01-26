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
    'ngIdle'
  ]).config(function ($routeProvider) {
    /** NOTE: sandbox.html is for checking how app components look
      UNCOMMENT THE BELOW IF YOU WANT TO SEE HOW UI ELEMENTS LOOK IN FMR
      NOTE: NOT FOR USE LIVE
      */
    // $routeProvider
    //   .when('/', {
    //     templateUrl: 'views/sandbox.html',
    //   })
    //   .when('/sandbox', {
    //     templateUrl: 'views/sandbox.html',
    //   })
    $routeProvider
      // .when('/', {
      //   templateUrl: 'views/esec.html',
      //   controller: 'MainController'
      // })
      .when('/login', {
        // templateUrl: 'views/esec.html',
        // controller: 'MainController'
        templateUrl: 'views/esec-login.html',
        controller: 'LoginController'
      })
      .when('/login/error', {
        templateUrl: 'views/esec-login-error.html',
        controller: 'LoginController'
        // templateUrl: 'views/esec.html',
        // templateUrl: 'views/esec-login.html',
      })
      .when('/registration', {
        templateUrl: 'views/esec-registration.html',
        controller: 'LoginController'
      })
      .when('/registration/success', {
        templateUrl: 'views/esec-success.html',
        controller: 'MainController'
      })
      .when('/registration/error', {
        templateUrl: 'views/esec-login-error.html',
        controller: 'LoginController'
      })
      // TODO (Drew) remove route?
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
      .otherwise({
        redirectTo: HOMEPAGE
      });
  })  //global event handler
  .run(function($rootScope, $window, $location, ipCookie) {
    //Hamburger menu toggle
    $(".navbar-nav li a").click(function (event) {
      // check if window is small enough so dropdown is created
      var toggle = $(".navbar-toggle").is(":visible");
      if (toggle) {
        $(".navbar-collapse").collapse('hide');
      }
    });

    $window.$rootScope = $rootScope;


    // var exceptions = ["/login/error", "/registration", "/registration/error", "/registration/success"];
    // These are the paths that can be navigated to from external sources.
    // All other paths must be navigated to interally.
    $rootScope.$on('$routeChangeStart', function (event) {
      window.ipCookie = ipCookie;
      const notLoggedIn = !ipCookie('authentication_token');
      const exceptions = [HOMEPAGE, "/login", "/login/error", "/registration", "/registration/error", "/about", "/about/sharedride", "/about/projecthistory"];

      if (!$window.visited) {
        if (exceptions.indexOf($location.$$path) < 0) {
          if (notLoggedIn) {
            event.preventDefault();
            $rootScope.$emit('Login');
          } else {
            $location.path(HOMEPAGE);
          }
        }
      }

      // TODO (Drew Teter, 09/22/2022) Fully Remove ability for guest login.
      // We plan on doing this in the future. But, as no tickets have been created
      // for this task yet, I'm just putting a redirect here as a temporary fix.

      // If not logged in, and visiting a private page, redirect to login.
      // var publicPages = ["/registration", "/registration/error"];
      const publicPages = ['/login', '/login/error', '/registration', '/registration/error', '/about', '/about/sharedride', '/about/projecthistory', '/lookupIdForm', '/lookupError'];

      if (notLoggedIn && publicPages.indexOf($location.$$path) === -1) {
        event.preventDefault();
        $rootScope.$emit('Login');
      }

      return false;
    });

    $rootScope.$on('Login', navigate_to_login_form);
    $rootScope.$on('Logout', logout_and_clear_cache);

    // Sends the browser to the backend,
    // Which then redirects the browser to AWS Cognito
    // Which then redirects you to ESEC's login form.
    // After login, the browser redirects it's way back now the stack again
    function navigate_to_login_form (e) {
      e.preventDefault();
      const clientOrigin = window.location.origin;

      let callbackUrl = new URL(clientOrigin);
      callbackUrl.pathname = "/";
      callbackUrl.hash = "/login";

      let loginUrl = new URL(clientOrigin);
      loginUrl.host = APIHOST;
      loginUrl.pathname = "/api/v3/sso/authorize";
      loginUrl.searchParams.set("clientCallback", callbackUrl.toString());

      document.location.href = loginUrl.href;
    }

    function logout_and_clear_cache (e) {
      e.preventDefault();

      let cache = ipCookie();
      for (const key in cache) {
        ipCookie.remove(key);
      }
      sessionStorage.clear();
      localStorage.clear();

      console.log("logout");
      const clientOrigin = window.location.origin;
      let logoutUrl = new URL(clientOrigin);
      logoutUrl.host = APIHOST;
      logoutUrl.pathname = "/api/v3/sso/logout";

      document.location.href = logoutUrl.href;
    }
  });
