(function() {
  'use strict';

  angular.module('tc.services').factory('ChallengeService', ChallengeService);

  ChallengeService.$inject = ['CONSTANTS', 'ApiService', '$q'];

  function ChallengeService(CONSTANTS, ApiService, $q) {

    var rApi = ApiService.restangularV3;
    var api = ApiService.restangularV3;

    var service = {
      getChallenges: getChallenges,
      getiOSChallenges: getiOSChallenges,
      getMyMarathonMatches: _getMyMarathonMatches,
      getReviewEndDate: getReviewEndDate,
      getChallengeDetails: getChallengeDetails
    };
    return service;

    function getChallenges(params) {
      var challengePromise = api.all('challenges').getList(params);
      // var marathonPromise = api.all('marathonMatches').getList(params);
      return $q.all([challengePromise])
        .then(function(responses) {
          // var data = responses[0].concat(responses[1]);
          // TDOO - sort, calculate metadata.totalCount
          var data = responses[0];
          return data;
        });
    }

    function getiOSChallenges() {
      var peerParams = {
        'filter[reviewType]': 'PEER',
        'filter[status]': 'Active',
        limit: 3
      };

      var iOSParams = {
        'filter[reviewType]': 'COMMUNITY,INTERNAL',
        'filter[status]': 'Active',
        limit: 3
      };

      var peerChallenges = api.all('challenges').getList(peerParams);
      var iOSChallenges  = api.all('challenges').getList(iOSParams);

      return peerChallenges;
      // return $q.all([peerChallenges, iOSChallenges]);
    }

    /** NOT USED NEEDS TO BE REFACTORED **/

    function _getMyActiveChallenges(request) {
      var deferred = $q.defer();

      var prevRequest = rApi.request;

      // If my active challenges has already been retrieved, simply return it
      if(rApi.myActiveChallenges && rApi.myActiveChallenges != "waiting" && !uniqueRequest(prevRequest, request)) {
        deferred.resolve(rApi.myActiveChallenges);
      } else {
        // Otherwise, set state to waiting, so that only one call is done to the server
        rApi.myActiveChallenges = "waiting";

        // Add promise to list to it can be resolved when call returns
        rApi.activeChallengeDeferredList.push(deferred);

        // add default paging
        var pageIndex = request && request.pageIndex ? request.pageIndex : 1;
        var pageSize = request && request.pageSize ? request.pageSize : 10;
        var sortColumn  = request && request.sortColumn ? request.sortColumn : 'submissionEndDate';
        var sortOrder  = request && request.sortOrder ? request.sortOrder : 'asc';
        var listType  = request && request.listType ? request.listType : 'active';
        var userId  = request && request.userId ? request.userId : null;

        rApi.request = request;

        var filter = [];
        if (listType) {
          filter.push("listType=" + listType);
        }
        if (userId) {
          filter.push("userId=" + userId);
        }
        filter = filter.join("&");

        // Fetch list of active challenges for current user
        rApi.all("challenges").getList({
            type: listType,
            pageIndex: pageIndex,
            pageSize: pageSize,
            sortColumn: sortColumn,
            sortOrder: sortOrder
          }).then(function(data) {
            // Sets the data, and returns it to all pending promises
            rApi.myActiveChallenges = data;
            angular.forEach(rApi.activeChallengeDeferredList, function(def) {
              def.resolve(rApi.myActiveChallenges);
            });
            rApi.activeChallengeDeferredList = [];
            return rApi.myActiveChallenges;
          });
      }

      return deferred.promise;
    }

    function _getMyMarathonMatches(request) {
      var deferred, listType, prevRequest, sortColumn, sortOrder;
      deferred = $q.defer();
      prevRequest = rApi.mmRequest;
      if (rApi.myMarathonMatches && rApi.myMarathonMatches !== 'waiting') {
        deferred.resolve(rApi.myMarathonMatches);
      } else {
        rApi.myMarathonMatches = 'waiting';
        rApi.marathonMatchesDeferredList.push(deferred);
        sortColumn = request && request.sortColumn ? request.sortColumn : 'submissionEndDate';
        sortOrder = request && request.sortOrder ? request.sortOrder : 'asc';
        listType = request && request.type ? request.type : 'active';
        rApi.request = request;
        rApi.all('marathonMatches').getList({
          listType: listType,
          sortColumn: sortColumn,
          sortOrder: sortOrder
        }).then(function(data) {
          rApi.myMarathonMatches = data;
          angular.forEach(rApi.marathonMatchesDeferredList, function(def) {
            def.resolve(rApi.myMarathonMatches);
          });
          rApi.marathonMatchesDeferredList = [];
          return rApi.myMarathonMatches;
        });
      }
      return deferred.promise;
    }
    function _uniqueRequest(prevRequest, currRequest) {
      if (!prevRequest || !currRequest) return true;
      return prevRequest.pageIndex != currRequest.pageIndex ||
        prevRequest.pageSize != currRequest.pageSize ||
        prevRequest.sortColumn != currRequest.sortColumn ||
        prevRequest.sortOrder != currRequest.sortOrder ||
        prevRequest.listType != currRequest.listType;
    }

    function getReviewEndDate(challengeId) {
      var url = CONSTANTS.API_URL + '/phases/?filter=' + encodeURIComponent('challengeId=' + challengeId + ' & phaseType=4');
      return ApiService.requestHandler('GET', url);
    }

    function getChallengeDetails(challengeId) {
      var url = CONSTANTS.API_URL_V2 + '/challenges/' + challengeId;
      return ApiService.requestHandler('GET', url, {}, true);
    }

  };

})();