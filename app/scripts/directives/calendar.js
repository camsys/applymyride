'use strict';

var app = angular.module('applyMyRideApp');

app.directive('datepickerPopup', ['datepickerPopupConfig', 'dateParser', 'dateFilter', function (datepickerPopupConfig, dateParser, dateFilter) {
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
