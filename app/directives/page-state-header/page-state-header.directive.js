(function () {
  'use strict';

  angular.module('tcUIComponents').directive('pageStateHeader', function() {
    return {
      restrict: 'E',
      templateUrl: 'directives/page-state-header/page-state-header.directive.html',
      scope: {
        handle: '@',
        pageTitle: '@',
        showBackLink: '=',
        hideMoney: '=',
        defaultState: '@'
      },
      controller: ['$scope', 'NotificationService', 'ProfileService', '$log', pageStateHeader],
      controllerAs: "vm"
    };
  });

  function pageStateHeader($scope, NotificationService, ProfileService, $log) {
    var vm = this;
    vm.handle = $scope.handle;
    vm.profile = null;
    vm.handleColor = null;
    vm.hideMoney = $scope.hideMoney;
    vm.previousStateName = null;
    vm.previousStateLabel = null;
    vm.previousState = null;

    activate();

    function activate() {
      vm.loading = true;
      vm.hideMoney = false;

      // identifies the previous state
      if ($scope.$root.previousState && $scope.$root.previousState.name.length > 0) {
        console.log($scope.$root.previousState);
        vm.previousState = $scope.$root.previousState;
        vm.previousStateName = vm.previousState.name;
      } else if ($scope.defaultState) {
        vm.previousStateName = $scope.defaultState;
      }

      // sets the label of the link based on the state
      if (vm.previousStateName) {
        if (vm.previousStateName === 'dashboard') {
          vm.previousStateLabel = 'Dashboard';
        } else if (vm.previousStateName === 'profile') {
          vm.previousStateLabel = 'Profile';
        }
      }

      // gets member's profile
      ProfileService.getUserProfile(vm.handle).then(function(profile) {
        vm.profile = profile;
        vm.handleColor = ProfileService.getUserHandleColor(vm.profile);

        displayMoneyEarned(vm.handle);
      });
    }

    function displayMoneyEarned(handle) {
      ProfileService.getUserFinancials(handle)
      .then(function(financials) {
        vm.moneyEarned = _.sum(_.pluck(financials, 'amount'));

        if (!vm.moneyEarned) {
          vm.hideMoney = true;
        }

        vm.loading = false;
      })
      .catch(function(err) {
        vm.hideMoney = true;
        vm.loading = false;
      });
    }
  }
})();