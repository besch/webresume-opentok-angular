'use strict';

angular.module('mean')

.factory('opentokData', ['$http', '$q', function($http, $q) {
  return {
    getData: function() {
      return $http.get('/videoresume/index');
    }
  };
}])

.controller('VideoresumeController', ['$scope', '$http', 'Global', 'OTSession', '$log', 'opentokData', 'TB',
  function($scope, $http, Global, OTSession, $log, opentokData, TB, Videoresume) {
    $scope.global = Global;

    // var archiveId = null;

    $http.get('/videoresume/history').then(function(res) {
      $scope.archives = res.data.archives;
    });

    var idOfArchive = null;

    $scope.turnOnCamera = function() {
      // $http.get('/videoresume/index').then(function(res) {
      //   var data = res.data;
      //   $scope.apiKey = data.apiKey;

        // var session = TB.initSession(data.sessionId),
        //     publisher = TB.initPublisher('publisher');

        ///////////////////////////////////////////////////////////////////////////////////
        var promise = opentokData.getData(),
            data;

        promise.then(function(res) {
          data = res.data;

          OTSession.init(data.apiKey, data.sessionId, data.token);
          $scope.streams = OTSession.streams;
        });

        ///////////////////////////////////////////////////////////////////////////////////

        // session.connect(data.apiKey, data.token, function(err, info) {
        //   if(err) {
        //     alert(err.message || err);
        //   }
        //   session.publish(publisher);
        // });
      // });
      $scope.isCameraOn = true;
    };


    $scope.startRecording = function(e) {
      $http.get('/videoresume/start').then(function(res) {
        // console.log(res);
        idOfArchive = res.data.id;
        $scope.isDisabled = true;
      });
    };

    $scope.stopRecording = function() {
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
    // console.log(input);
    if(input !== null) {
      // $scope.isAvailable = true;
      return $sce.trustAsResourceUrl(input.split('?')[0]);
    }
    else {
      return input;
    }
  };
}])

/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////


// .factory('TB', ['TB', function (TB) {
//     return TB;
// }])

.factory('OTSession', ['TB', '$rootScope', function (TB, $rootScope) {
    var OTSession = {
        streams: [],
        publishers: [],
        init: function (apiKey, sessionId, token, cb) {
            this.session = TB.initSession(sessionId);
            
            OTSession.session.on({
                sessionConnected: function(event) {
                    OTSession.publishers.forEach(function (publisher) {
                        OTSession.session.publish(publisher);
                    });
                },
                streamCreated: function(event) {
                    $rootScope.$apply(function() {
                        OTSession.streams.push(event.stream);
                    });
                },
                streamDestroyed: function(event) {
                    $rootScope.$apply(function() {
                        OTSession.streams.splice(OTSession.streams.indexOf(event.stream), 1);
                    });
                },
                sessionDisconnected: function(event) {
                    $rootScope.$apply(function() {
                        OTSession.streams.splice(0, OTSession.streams.length);
                    });
                }
            });
            
            this.session.connect(apiKey, token, function (err) {
                if (cb) cb(err, OTSession.session);
            });
            this.trigger('init');
        }
    };
    TB.$.eventing(OTSession);
    return OTSession;
}])

.directive('otLayout', ['$window', '$parse', 'TB', 'OTSession', function($window, $parse, TB, OTSession) {
    return {
        restrict: 'E',
        link: function(scope, element, attrs) {
            var props = $parse(attrs.props)();
            var container = TB.initLayoutContainer(element[0], props);
            scope.$watch(function() {
                return element.children().length;
            }, container.layout);
            $window.addEventListener('resize', container.layout);
            scope.$on('otLayout', container.layout);
            var listenForStreamChange = function listenForStreamChange(session) {
                OTSession.session.on('streamPropertyChanged', function (event) {
                    if (event.changedProperty === 'videoDimensions') {
                        container.layout();
                    }
                });
            };
            if (OTSession.session) listenForStreamChange();
            else OTSession.on('init', listenForStreamChange);
        }
    };
}])

.directive('otPublisher', ['$document', '$window', 'OTSession', 'TB', 'opentokData', function($document, $window, OTSession, TB, opentokData) {
    return {
        restrict: 'A',
        scope: {
            props: '&'
        },
        link: function(scope, element, attrs){


          var promise = opentokData.getData(),
              apiKey;

          promise.then(function(res) {
            apiKey = res.data.apiKey;
          });



          console.log(apiKey);
            var props = scope.props() || {};
            props.width = props.width ? props.width : element.width();
            props.height = props.height ? props.height : element.height();
            var oldChildren = element.children();
            scope.publisher = TB.initPublisher(attrs.apikey || apiKey,
                element[0], props, function (err) {
                if (err) {
                    scope.$emit('otPublisherError', err, scope.publisher);
                }
            });
            // Make transcluding work manually by putting the children back in there
            element.append(oldChildren);
            scope.publisher.on({
                accessAllowed: function(event) {
                    element.addClass('allowed');
                },
                loaded: function (event){
                    scope.$emit('otLayout');
                }
            });
            scope.$on('$destroy', function () {
                if (scope.session) scope.session.unpublish(scope.publisher);
                else scope.publisher.destroy();
                OTSession.publishers = OTSession.publishers.filter(function (publisher) {
                    return publisher !== scope.publisher;
                });
                scope.publisher = null;
            });
            if (OTSession.session && (OTSession.session.connected ||
                    (OTSession.session.isConnected && OTSession.session.isConnected()))) {
                OTSession.session.publish(scope.publisher, function (err) {
                    if (err) {
                        scope.$emit('otPublisherError', err, scope.publisher);
                    }
                });
            }
            OTSession.publishers.push(scope.publisher);
        }
    };
}])

.directive('otSubscriber', ['OTSession', function(OTSession) {
    return {
        restrict: 'A',
        scope: {
            stream: '=',
            props: '&'
        },
        link: function(scope, element, attrs){
            var stream = scope.stream,
                props = scope.props() || {};
            props.width = props.width ? props.width : element.width();
            props.height = props.height ? props.height : element.height();
            var oldChildren = element.children();
            var subscriber = OTSession.session.subscribe(stream, element[0], props, function (err) {
                if (err) {
                    scope.$emit('otSubscriberError', err, subscriber);
                }
            });
            subscriber.on('loaded', function () {
                scope.$emit('otLayout');
            });
            // Make transcluding work manually by putting the children back in there
            element.append(oldChildren);
            scope.$on('$destroy', function () {
                subscriber.destroy();
            });
        }
    };
}]);