'use strict';

angular.module('mean')

.controller('VideoresumeController', ['$scope', '$http', 'Global', 'OTSession',
  function($scope, $http, Global, OTSession, Videoresume) {
    $scope.global = Global;
    $scope.videoresume = {
        name: 'videoresume'
    };

    $scope.startArchive = function() {
    	$http.get('videoresume/host')
    		.success(function(data) {
    			console.log(data);
          $scope.apiKey = data.apiKey;
          $scope.sessionId = data.sessionId;
          $scope.token = data.token;

          var session = OTSession.initSession($scope.sessionId),
              publisher = OTSession.initPublisher('publisher');
              // archiveID = null;

          session.connect($scope.apiKey, $scope.token, function(err, info) {
            if(err) {
              alert(err.message || err);
            }
            session.publish(publisher);
          });

          session.on('streamCreated', function(event) {
            session.subscribe(event.stream, 'subscribers', { insertMode: 'append' });
          });     
    		})
    		.error(function(err) {
    			return console.log(err);
    		});
    };

    $scope.stopArchive = function() {
    	$http.get('videoresume/stop')
    		.success(function(data) {
    			console.log(data);
          $scope.apiKey = data.apiKey;
          $scope.sessionId = data.sessionId;
          $scope.token = data.token;

          var session = OTSession.initSession($scope.sessionId),
              publisher = OTSession.initPublisher('publisher'),
              archiveID = null;

          session.connect($scope.apiKey, $scope.token, function(err, info) {
            if(err) {
              alert(err.message || err);
            }
            session.publish(publisher);
          });

          session.on('streamCreated', function(event) {
            session.subscribe(event.stream, 'subscribers', { insertMode: 'append' });
          });

          session.on('archiveStarted', function(event) {
            archiveID = event.id;
            console.log('ARCHIVE STARTED');
            // $('.start').hide();
            // $('.stop').show();
          });

          session.on('archiveStopped', function(event) {
            archiveID = null;
            console.log('ARCHIVE STOPPED');
            // $('.start').show();
            // $('.stop').hide();
          });

          // $(document).ready(function() {
          //   $('.start').click(function(event){
          //     $.get('start');
          //   }).show();
          //   $('.stop').click(function(event){
          //     $.get('stop/' + archiveID);
          //   }).hide();
          // });
    		})
    		.error(function(err) {
    			return console.log(err);
    		});
    };
  }
]);