import angular from 'angular'

(function() {
  'use strict'

  var dependencies = [
    'ui.router',
    'tc.services',
    'ngIsoConstants',
    'angucomplete-alt',
    'blocks.logger'
  ]

  angular.module('tc.account', dependencies)
})()
