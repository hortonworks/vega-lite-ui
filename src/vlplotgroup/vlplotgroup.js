'use strict';

/**
 * @ngdoc directive
 * @name vega-lite-ui.directive:visListItem
 * @description
 * # visListItem
 */
angular.module('vlui')
  .directive('vlPlotGroup', function (consts, vl, Dataset, Drop, Logger) {
    return {
      templateUrl: 'vlplotgroup/vlplotgroup.html',
      restrict: 'E',
      replace: true,
      scope: {
        /* pass to vlplot **/
        chart: '=',

        //optional
        disabled: '=',
        isInList: '=',

        alwaysScrollable: '=',
        configSet: '@',
        maxHeight: '=',
        maxWidth: '=',
        overflow: '=',
        priority: '=',
        rescale: '=',
        thumbnail: '=',
        tooltip: '=',

        /* vlplotgroup specific */

        fieldSet: '=',

        showBookmark: '@',
        showDebug: '=',
        showExpand: '=',
        showFilterNull: '@',
        showLabel: '@',
        showLog: '@',
        showMarkType: '@',
        showSort: '@',
        showTranspose: '@',

        alwaysSelected: '=',
        isSelected: '=',
        highlighted: '=',
        expandAction: '&',
        chartType: '='
      },
      link: function postLink(scope, element) {

        scope.consts = consts;
        scope.Dataset = Dataset;


        // TOGGLE LOG

        scope.log = {};
        scope.log.support = function(spec, encType) {
          if (!spec) { return false; }
          var encoding = spec.encoding,
            field = encoding[encType];

          return field && field.type ==='Q' && !field.bin;
        };

        scope.log.toggle = function(spec, encType) {
          if (!scope.log.support(spec, encType)) { return; }

          var field = spec.encoding[encType],
            scale = field.scale = field.scale || {};

          scale.type = scale.type === 'log' ? 'linear' : 'log';
          Logger.logInteraction(Logger.actions.LOG_TOGGLE, scope.chart.shorthand);
        };
        scope.log.active = function(spec, encType) {
          if (!scope.log.support(spec, encType)) { return; }

          var field = spec.encoding[encType],
            scale = field.scale = field.scale || {};

          return scale.type === 'log';
        };

        // TOGGLE SORT

        var toggleSort = scope.toggleSort = function(spec) {
          Logger.logInteraction(Logger.actions.SORT_TOGGLE, scope.chart.shorthand);
          vl.Encoding.toggleSort(spec);
        };
        //FIXME
        toggleSort.support = vl.Encoding.toggleSort.support;

        // TOGGLE FILTER

        scope.toggleFilterNull = function(spec, stats) {
          Logger.logInteraction(Logger.actions.NULL_FILTER_TOGGLE, scope.chart.shorthand);

          vl.Encoding.toggleFilterNullO(spec, stats);
        };
        scope.toggleFilterNull.support = vl.Encoding.toggleFilterNullO.support;

        var debugPopup = new Drop({
          content: element.find('.dev-tool')[0],
          target: element.find('.fa-wrench')[0],
          position: 'bottom right',
          openOn: 'click',
          constrainToWindow: true
        });

        scope.toggleSortClass = function(vlSpec) {
          var direction = vlSpec && vl.Encoding.toggleSort.direction(vlSpec),
            mode = vlSpec && vl.Encoding.toggleSort.mode(vlSpec);

          if (direction === 'y') {
            return mode === 'Q' ? 'fa-sort-amount-desc' :
              'fa-sort-alpha-asc';
          } else if (direction === 'x') {
            return mode === 'Q' ? 'fa-sort-amount-desc sort-x' :
              'fa-sort-alpha-asc sort-x';
          } else {
            return 'invisible';
          }
        };

        scope.transpose = function() {
          Logger.logInteraction(Logger.actions.TRANSPOSE_TOGGLE, scope.chart.shorthand);
          vl.Encoding.transpose(scope.chart.vlSpec);
        };

        scope.chartChange = function(chartType) {
          scope.chartType = chartType;
        };

        scope.toggleFullscreen = function() {
          var elements = document.getElementsByClassName("vl-plot-group");
          if(elements.length > 0) {
            var element = elements[0];
            /*var req = element.requestFullScreen || element.webkitRequestFullScreen || element.mozRequestFullScreen;
            req.call(element);*/
            if (!document.fullscreenElement &&    // alternative standard method
                !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
              if (element.requestFullscreen) {
                element.requestFullscreen();
              } else if (element.msRequestFullscreen) {
                element.msRequestFullscreen();
              } else if (element.mozRequestFullScreen) {
                element.mozRequestFullScreen();
              } else if (element.webkitRequestFullscreen) {
                element.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
              }
            } else {
              if (document.exitFullscreen) {
                document.exitFullscreen();
              } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
              } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
              } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
              }
            }
          }
        }
        scope.$on('$destroy', function() {
          scope.chart = null;
          debugPopup.destroy();
        });
      }
    };
  });
