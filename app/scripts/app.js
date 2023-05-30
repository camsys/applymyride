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
  ]).config(function ($routeProvider, $httpProvider) {
    // $httpProvider.defaults.headers.common['Access-Control-Request-Headers'] = 'Origin, X-Requested-With, Authorization';
    // $httpProvider.defaults.headers.common['Access-Control-Request-Method'] = 'GET';
    // $httpProvider.defaults.headers.post['Access-Control-Request-Method'] = 'POST';
    // $httpProvider.defaults.headers.put['Access-Control-Request-Method'] = 'Put';
    // $httpProvider.defaults.withCredentials = true;
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
      .when('/login', {
        templateUrl: 'views/esec-login.html',
        controller: 'LoginController'
      })
      .when('/login/error', {
        templateUrl: 'views/esec-login-error.html',
        controller: 'LoginController'
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
        templateUrl: 'views/esec-registration-error.html',
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
      .otherwise({
        redirectTo: HOMEPAGE
      });
  })
  .run(function ($rootScope, $window, $location, ipCookie, $http) {
    // ipCookie('test', 'abc; SameSite=None; Secure; httpOnly: true; domain: ' + apiUrl('/').host);
    // $http.get(apiUrl('/api/v3/sso/test').toString());
    $window.$http = $http;

    // Navigation Friendly Pages are safe to link to from an external source, or to refresh the browser on.
    // Other pages may expect the application to be in a specific state.
    // Public Pages do not require the user to be logged in.
    // Protected Pages require at least a partial login. Such as having an unregistered Keystone Login
    const navigationFriendlyPages = [HOMEPAGE, '/profile', '/plan', '/plan/my_rides', '/login', '/login/error', '/registration', '/registration/error', '/about', '/about/sharedride', '/about/projecthistory'];
    const publicPages = ['/login', '/login/error', '/about', '/about/sharedride', '/about/projecthistory'];
    const protectedPages = ['/registration', '/registration/error', '/lookupIdForm', '/lookupError'];
    const sessionKeys = ['jwt', 'refresh_token', 'account_type', 'authentication_token', 'sharedRideId', 'county', 'first_name', 'last_name', 'email'];

    // Global event handlers
    window.$rootScope = $rootScope;
    $window.$rootScope = $rootScope;
    $rootScope.userInfo = getUserFromCookies();
    $rootScope.channels = { login: {}, logout: {} };
    $rootScope.$on('Login', requestLoginHandler);
    $rootScope.$on('Logout', logoutEventHandler);
    $rootScope.$on('$routeChangeStart', authorizePage);

    // If not on a navigation friendly page during initial load, redirect to homepage
    if (navigationFriendlyPages.indexOf($location.$$path) === -1) {
      $location.path(HOMEPAGE);
      return false;
    }

    // --- Helper functions ---
    function keystoneLogin () {
      return !!(
        $rootScope.userInfo &&
        $rootScope.userInfo.jwt
      );
    }

    function oneclickLogin () {
      return !!(
        $rootScope.userInfo &&
        $rootScope.userInfo.authentication_token
      );
    }

    function getLoginState () {
      let state = 0; // Not logged in;
      if (keystoneLogin()) { state = 1; } // Partial login, needs matching Oneclick User
      if (oneclickLogin()) { state = 2; } // Full login

      return state;
    }
    $rootScope.getLoginState = getLoginState;

    function isCitizen() {
      return $rootScope.userInfo.account_type === 'CITIZEN';
    }
    $rootScope.isCitizen = isCitizen;

    function redirectNonCitizens(loginState) {
      if (loginState > 0 && isCitizen() === false) {
        let url = apiUrl('/api/v3/sso/admin');
        url.searchParams.set('user[jwt]', $rootScope.userInfo.jwt);
        document.location.href = url.href;
        return true;
      }

      return false;
    }
    $rootScope.redirectNonCitizens = redirectNonCitizens;

    function clearData () {
      $rootScope.userInfo = {};
      localStorage.clear();
      sessionStorage.clear();
      for (const cookie in ipCookie()) {
        ipCookie.remove(cookie);
      }
    }
    $rootScope.clearData = clearData;

    // TODO (Drew) decide if we should stop using cookies and use local storage instead.
    // Gets the user info from Cookies
    // returns an object
    function getUserFromCookies () {
      let userInfo =  {};
      sessionKeys.forEach((key) => {
        userInfo[key] = ipCookie(key);
      });

      return userInfo;
    }
    $rootScope.getUserFromCookies = getUserFromCookies;

    // Sends the browser to the backend, which redirects to AWS Cognito
    // Which then redirects the user to ESEC's login form.
    function requestLoginHandler (e) {
      e.preventDefault();

      const clientOrigin = window.location.origin;
      let callbackUrl = new URL(clientOrigin);
      callbackUrl.pathname = '/';
      callbackUrl.hash = '/login';

      let loginUrl = apiUrl('/api/v3/sso/authorize');
      loginUrl.searchParams.set('clientCallback', callbackUrl.toString());

      // Call callback functions that other controllers attached to this event
      const subscriptions = Object.values($rootScope.channels.login);
      for(let subscription in subscriptions) {
        subscription();
      }

      document.location.href = loginUrl.href;
      return false;
    }

    function logoutEventHandler(e) {
      e.preventDefault();
      clearData();

      // Call callback functions that other controllers attached to this event
      const subscriptions = Object.values($rootScope.channels.logout);
      for(let subscription in subscriptions) {
        subscription();
      }

      let logoutUrl = apiUrl('/api/v3/sso/logout');
      document.location.href = logoutUrl.href;
      return false;
    }

    function authorizePage (event) {
      console.log('authorize:', event);
      const path = $location.$$path;
      const loginState = getLoginState();
      const isPublic = publicPages.indexOf(path) > -1;
      const isLoggedIn = loginState === 2;
      const partialLoginAllowed = protectedPages.indexOf(path) > -1 && loginState >= 1;

      // Authorize access to any public page
      // Send Non-Citizen Users to the Admin Portal
      // Authorize access to any page if user is logged in
      // Authorize access to protected, but not private, pages for partial logins
      if (isPublic) { return true; }
      if (redirectNonCitizens(loginState)) { return false; }
      if (isLoggedIn || partialLoginAllowed) { return true; }

      // For unauthorized pages,
      // Redirect partial logins to registration
      // Redirect all other users to Login Page on ESEC
      if (loginState > 0) {
        $location.path('/registration');
      } else {
        clearData();
        $rootScope.$emit('Login');
      }

      return false;
    }
  });
