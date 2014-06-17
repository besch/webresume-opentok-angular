'use strict';

angular.module('mean')

// service('OpentokData', function($http, $q) {
//     this.get = function(){
//       var deferred = $q.defer();
//       $http.get('/videoresume/host')
//         .success(function(data, status) {
//           deferred.resolve(data);
//         })
//         .error(function(data, status) {
//           deferred.reject(data);
//         });

//       return deferred.promise;
//     } 
//   }
// );

.controller('VideoresumeController', ['$scope', '$http', 'Global', 'OTSession', 'TB', '$log',
  function($scope, $http, Global, OTSession, TB, $log, Videoresume) {
    $scope.global = Global;

    $scope.startArchive = function() {
      $http.get('/videoresume/host').then(function(data) {

        // return console.log(data);

        var session = TB.initSession(data.sessionId),
            publisher = TB.initPublisher('publisher');
                // archiveID = null;


        session.connect(data.apiKey, data.token, function(err, info) {
          if(err) {
            alert(err.message || err);
          }
          session.publish(publisher);
        });

        session.on('streamCreated', function(event) {
          session.subscribe(event.stream, 'subscribers', { insertMode: 'append' });
        });
      });
    };

    $scope.stopArchive = function() {
    	$http.get('videoresume/stop')
    		.success(function(data) {

          var apiKey = data.apiKey,
              sessionId = data.sessionId,
              token = data.token;

          var session = OTSession.initSession(sessionId),
              publisher = OTSession.initPublisher('publisher'),
              archiveID = null;

          session.connect(apiKey, token, function(err, info) {
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