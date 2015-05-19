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
