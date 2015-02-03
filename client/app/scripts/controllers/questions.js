'use strict';

angular.module('clientApp')
.controller('QuestionsController', function ($scope) {
  $scope.questions = [
  [
  {question: 'Application Type',
  options: [
  {text: 'New Applicant', checked: true},
  {text: 'Recertification', checked: false}
  ], datatype: 'radio', name: 'applicationtype'},
  {question: 'First Name', datatype: 'string'},
  {question: 'Last Name', datatype: 'string'},
  ],
  [
  {question: 'Address', datatype: 'string'},
  {question: 'City', datatype: 'string'},
  ],

  ];
});