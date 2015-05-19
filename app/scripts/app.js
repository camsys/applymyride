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
    'ngCookies',
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
  ]).config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/login.html',
        controller: 'LoginController'
      })
      .when('/authenticateEmail', {
        templateUrl: 'views/login.html',
        controller: 'LoginController'
      })
      .when('/authenticateSharedRideId', {
        templateUrl: 'views/login.html',
        controller: 'LoginController'
      })
      .when('/register', {
        templateUrl: 'views/register.html',
        controller: 'RegisterController'
      })
      .when('/questions/:sectionId', {
        templateUrl: 'views/questions.html',
        controller: 'QuestionsController'
      })
      .when('/try-it-out', {
        templateUrl: 'views/try-it-out.html',
        controller: 'PlanController'
      })
      .when('/plan', {
        templateUrl: 'views/plan.html',
        controller: 'PlanController'
      })
      .when('/plan/:step', {
        templateUrl: 'views/plan.html',
        controller: 'PlanController'
      })
      .when('/plan2', {
        templateUrl: 'views/plan2.html',
        controller: 'PlanController'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutController'
      })
      .when('/questions/:sectionId', {
        templateUrl: 'views/questions.html',
        controller: 'QuestionsController'
      })
      .when('/eligibility', {
        templateUrl: 'views/eligibility.html',
        controller: 'EligibilityController'
      })
      .otherwise({
        redirectTo: '/'
      });

  })  //global event handler
  .run(function($rootScope, $window) {
    $rootScope.slide = '';
    $rootScope.$on('$routeChangeStart', function() {
      //event button to move backward
      $rootScope.back = function() {
        $rootScope.slide = 'slide-left';
        $window.history.back();
      }
      //event button item list to move forward
      $rootScope.next = function() {
        $rootScope.slide = 'slide-left';
      }
    });
  });;
