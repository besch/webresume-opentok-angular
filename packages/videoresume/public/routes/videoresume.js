'use strict';

angular.module('mean').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider
      .state('videoresume home', {
          url: '/videoresume',
          templateUrl: 'videoresume/views/index.html'
      })

      .state('videoresume history', {
          url: '/videoresume/history',
          templateUrl: 'videoresume/views/history.html'
      });

      
      // .state('videoresume host', {
      //     url: '/videoresume/host',
      //     templateUrl: 'videoresume/views/host.html'
      // })

      // .state('videoresume participants', {
      //     url: '/videoresume/participants',
      //     templateUrl: 'videoresume/views/participants.html'
      // })

      // .state('videoresume list', {
      //     url: '/videoresume/list',
      //     templateUrl: 'videoresume/views/history.html'
      // })

      // .state('videoresume view', {
      //     url: '/videoresume/view',
      //     templateUrl: 'videoresume/views/view.html'
      // })
  }
]);
