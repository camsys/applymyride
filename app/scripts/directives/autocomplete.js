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
