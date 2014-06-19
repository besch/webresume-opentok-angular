'use strict';

angular.module('mean')

.controller('VideoresumeController', ['$scope', '$rootScope', '$http', 'Global', 'OTSession', 'TB', '$log', '$q',
  function($scope, $rootScope, $http, Global, OTSession, TB, $log, $q, Videoresume) {
    $scope.global = Global;

    // var archiveId = null;

    $http.get('/videoresume/history').then(function(res) {
      $scope.archives = res.data.archives;
    });

    // $scope.$on('archiveStarted', function(event) {
    //   console.log(event);
    //   archiveId = event;
    //   $log.info('Recording started');
    //   $scope.isDisabled = true;
    // });

    // $scope.$on('archiveStopped', function(event) {
    //   // archiveId = null;
    //   $log.info('Recording stopped');
    //   $scope.isDisabled = false;
    // });

    // $scope.$on('streamCreated', function(event) {
    //   session.subscribe(event.stream, 'subscribers', {insertMode: 'append'});
    // });


    var idOfArchive = null;

    $scope.turnOnCamera = function() {
      $http.get('/videoresume/index').then(function(res) {
        var data = res.data;

        var session = TB.initSession(data.sessionId),
            publisher = TB.initPublisher('publisher');

        session.connect(data.apiKey, data.token, function(err, info) {
          if(err) {
            alert(err.message || err);
          }
          session.publish(publisher);
        });
      });
      $scope.isCameraOn = true;
    };

    $scope.startRecording = function(e) {
      $http.get('/videoresume/start').then(function(res) {
        idOfArchive = res.data.id;
        $scope.isDisabled = true;
      });
    };

    $scope.stopRecording = function() {
      $q.all([
        $http.get('/videoresume/stop/' + idOfArchive).then(function() {
          idOfArchive = null;
          $scope.isDisabled = false;
        }),
        $http.get('/videoresume/history')
      ]).then(function(res) {
        $scope.archives = res.data.archives;
      });
    };

    $scope.deleteArchive = function(id) {
      $http.get('/videoresume/delete/' + id).then(function(res) {
        $scope.archives = res.data.archives;
      });
    };
  }
])

.filter('splitUrl', ['$sce', function($sce) {
  return function(input) {
    return $sce.trustAsResourceUrl(input.split('?')[0]);
  };
}]);