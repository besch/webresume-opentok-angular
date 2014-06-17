'use strict';

angular.module('mean')

.controller('VideoresumeController', ['$scope', '$rootScope', '$http', 'Global', 'OTSession', 'TB', '$log',
  function($scope, $rootScope, $http, Global, OTSession, TB, $log, Videoresume) {
    $scope.global = Global;

    $rootScope.$on("$stateChangeSuccess", function (event, current, previous, rejection) {
      console.log(current);
      if(current == '/videoresume/host') {
        var archiveID = null;
        $http.get('/videoresume/host').then(function(data) {
          var session = TB.initSession(data.sessionId),
              publisher = TB.initPublisher('publisher');

          session.connect(data.apiKey, data.token, function(err, info) {
            if(err) {
              alert(err.message || err);
            }
            session.publish(publisher);
          });
        });
      }
    });


    $scope.$on('archiveStarted', function(e) {
      archiveId = event.id;
      $log.info('Recording started');
      $scope.disableToggle = true; // disable button "start"
    });

    $scope.$on('archiveStopped', function(e) {
      archiveId = null;
      $log.info('Recording stopped');
      $scope.disableToggle = false;
    });

    $scope.startRecording = function() {
      $http.get('/videoresume/start').then(function() {
        $scope.disableToggle = true; // ????????????
      });
    };

    $scope.stopRecording = function() {
      $http.get('/videoresume/stop' + archiveId).then(function() {
        $scope.disableToggle = true; // ????????????
      });
    };
  };
]);