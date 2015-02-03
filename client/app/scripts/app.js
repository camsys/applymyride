'use strict';

/**
 * @ngdoc overview
 * @name clientApp
 * @description
 * # clientApp
 *
 * Main module of the application.
 */
angular
  .module('clientApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider, $locationProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .when('/questions/:section', {
        templateUrl: 'views/questions.html',
        controller: 'QuestionsController'
      })
      .otherwise({
        redirectTo: '/'
      });

  // use the HTML5 History API
  // http://scotch.io/quick-tips/js/angular/pretty-urls-in-angularjs-removing-the-hashtag
  $locationProvider.html5Mode(true);

  });

