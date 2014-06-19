'use strict';

angular.module('mean')

.controller('VideoresumeController', ['$scope', '$rootScope', '$http', 'Global', 'OTSession', 'TB', '$log', '$q', '$timeout',
  function($scope, $rootScope, $http, Global, OTSession, TB, $log, $q, $timeout, Videoresume) {
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
        console.log(res);
        idOfArchive = res.data.id;
        $scope.isDisabled = true;
      });
    };

    $scope.stopRecording = function() {
      // $q.all([
      //   $http.get('/videoresume/stop/' + idOfArchive).then(function(res) {
      //     idOfArchive = null;
      //     $scope.isDisabled = false;
      //     $timeout(function(){
      //       $log.info('wait for 2 seconds');
      //     }, 2000);
      //   }),
      //   $http.get('/videoresume/history')
      // ]).then(function(res) {
      //   $scope.archives = res[1].data.archives;
      // });

      $http.get('/videoresume/stop/' + idOfArchive);
      $scope.isDisabled = false;
      setTimeout(function() {
        $scope.$apply(function() { // wait for opentok to apply changes
          $http.get('/videoresume/history').then(function(res) {
            $scope.archives = res.data.archives;
          });
        });
      }, 5000);
    };

    $scope.deleteArchive = function(id) {
      $http.get('/videoresume/delete/' + id);
      idOfArchive = null;
      setTimeout(function() { // wait for opentok to apply changes
        $scope.$apply(function() {
          $http.get('/videoresume/history').then(function(res) {
            $scope.archives = res.data.archives;
          });
        });
      }, 1000);
    };

    $scope.$watch('archives', function(newData) {
      $scope.archives = newData;
    });
  }
])

.filter('splitUrl', ['$sce', function($sce) {
  return function(input) {
    return $sce.trustAsResourceUrl(input.split('?')[0]);
  };
}]);