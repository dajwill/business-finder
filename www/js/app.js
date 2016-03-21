// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
var app = angular.module('starter', ['ionic', 'ngCordova'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    if(window.cordova && window.cordova.plugins.Keyboard) {
      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);
    }
    if(window.StatusBar) {
      StatusBar.styleDefault();
    }
  });
})

app.controller('MapController', function($scope, $cordovaGeolocation, $ionicLoading, $ionicPlatform, $http) {
    // window.localStorage['businesses'] = []
    ionic.Platform.ready(function(){
    //   $ionicLoading.show({
    //     template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!'
    //   });
    //
    //   var posOptions = {
    //       enableHighAccuracy: true,
    //       timeout: 20000,
    //       maximumAge: 0
    //   };
    //
    //   $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
    //     var lat  = position.coords.latitude;
    //     var long = position.coords.longitude;
    //     var stringLatLong =lat +', ' + long
    //     var count = 0;
    //     console.log(stringLatLong);
    //     var myLatlng = new google.maps.LatLng(lat, long);
    //
    //     var mapOptions = {
    //         center: myLatlng,
    //         zoom: 16,
    //         mapTypeId: google.maps.MapTypeId.ROADMAP
    //     };
    //
    //     var map = new google.maps.Map(document.getElementById("map"), mapOptions);
    //
    //     userLocation = new google.maps.Marker({
    //       map: map,
    //       draggable: true,
    //       // animation: google.maps.Animation.DROP,
    //       position: {lat: lat, lng: long}
    //
    //     });
    //
    //     $scope.map = map;
    //     $ionicLoading.hide();
    // }, function(err) {
    //     $ionicLoading.hide();
    //     console.log(err);
    // });
      $ionicLoading.show({
            template: '<ion-spinner icon="bubbles"></ion-spinner><br/>Acquiring location!'
        });

        var posOptions = {
            enableHighAccuracy: true,
            timeout: 20000,
            maximumAge: 0
        };

        $cordovaGeolocation.getCurrentPosition(posOptions).then(function (position) {
            var lat  = position.coords.latitude;
            var long = position.coords.longitude;

            var myLatlng = new google.maps.LatLng(lat, long);

            var stringLatLong =lat +', ' + long
            $scope.businesses = []
            console.log(stringLatLong);
            var myLatlng = new google.maps.LatLng(lat, long);

            var mapOptions = {
                center: myLatlng,
                zoom: 16,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            var map = new google.maps.Map(document.getElementById("map"), mapOptions);

            function findBusinesses(location){
              params = {
                v: 20130815,
                client_id: 'J5L2S0TPCFBV44DGYMFEODW51QFXSDLQ5Q15LYGGGC3YJEXR',
                client_secret: 'WH2NYJE0VNIP2J3MR5SPOWTWNRP2LC4FXP4ZKLT3QFPMFKPF',
                limit: 10,
                ll: location
              };
              $http.get('https://api.foursquare.com/v2/venues/explore', {params: params}).success(function(response){
                $scope.businesses = []
                angular.forEach(response.response.groups[0].items, function(item) {
                  $scope.businesses.push(item.venue)
                  item.venue.distance = calculateDistance(item.venue)
                  console.log(item.venue)
                  if( item.venue.photos.count == 0) {
                    $http.get('https://api.foursquare.com/v2/venues/4b50ee90f964a520593927e3/photos', {params: params}).success(function(response){
                      console.log('Photos');
                      image = response.response.photos.items[0].prefix + response.response.photos.items[0].suffix
                      item.venue.image = image
                      console.log(item.venue.image);
                    });
                  }
                })
                console.log($scope.businesses);
              });

            }

            function calculateDistance(venue) {
              var userPos = {
                lat: userLocation.position.lat(),
                lng: userLocation.position.lng()
              };
              var userPos = new google.maps.LatLng(userLocation.position.lat(), userLocation.position.lng())
              console.log($scope.businesses);
              var businessPos = new google.maps.LatLng(venue.location.lat, venue.location.lng)
              var distance = google.maps.geometry.spherical.computeDistanceBetween(userPos, businessPos)*0.000621371192;
              return distance
            }

            var businessMarkers = []

            function getBusinessMarkers(businesses) {
              angular.forEach(businesses, function(business) {
                var businessMarker = new google.maps.Marker({
                  map: map,
                  animation: google.maps.Animation.DROP,
                  position: {lat: business.location.lat, lng: business.location.lng},
                  icon: {
                    path: fontawesome.markers.MAP_MARKER,
                    scale: 0.5,
                    strokeWeight: 0.2,
                    strokeColor: 'black',
                    strokeOpacity: 1,
                    fillColor: '#47C8F9',
                    fillOpacity: 0.7
                  }
                });
                businessMarkers.push(businessMarker);
              })
            }

            function removeBusinessMarkers() {
              angular.forEach(businessMarkers, function(marker) {
                marker.setMap(null);
              })
            }

            $scope.imagePresent = function(image){
              if (angular.isUndefined(image)){
                return false
              } else {
                return true
              }
            }

            $scope.search = function(){
              findBusinesses(stringLatLong)
            }

            $scope.saveLocation = function(business) {
              window.localStorage.clear();
              window.localStorage.setItem(window.localStorage.length, JSON.stringify(business));
              console.log(window.localStorage.length);
            }

            $scope.deleteLocation = function(business) {
              for(i=0;i<window.localStorage.length;i++){
                if(window.localStorage.getItem(i) == JSON.stringify(business)) {
                  window.localStorage.removeItem(i);
                }
              }
            }

            $scope.isBusinessSaved = function(business) {
              var flag = false

              for(i=0;i<window.localStorage.length;i++){
                // console.log(window.localStorage.getItem(i));
                if(window.localStorage.getItem(i) == JSON.stringify(business)) {
                  flag = true
                }
              }
              return flag
            }

            userLocation = new google.maps.Marker({
              map: map,
              draggable: true,
              animation: google.maps.Animation.DROP,
              position: {lat: lat, lng: long}
            });

            getBusinessMarkers($scope.businesses)

            userLocation.addListener('dragend', function(e){
              lat = e.latLng.lat()
              long = e.latLng.lng()
              findBusinesses(stringLatLong)
              removeBusinessMarkers()
              getBusinessMarkers($scope.businesses)
            })

            findBusinesses(stringLatLong)
            $scope.map = map;
            $ionicLoading.hide();

        }, function(err) {
            $ionicLoading.hide();
            console.log(err);
        });
    });
});

app.factory('settings', function() {
    return {
      noImageUrl: "http://placehold.it/100x100"
    };
});

app.directive('noImage', function (settings) {

    var setDefaultImage = function (el) {
      el.attr('src', settings.noImageUrl);
    };

    return {
      restrict: 'A',
      link: function (scope, el, attr) {
        scope.$watch(function() {
          return attr.ngSrc;
        }, function () {
          var src = attr.ngSrc;

          if (!src) {
            setDefaultImage(el);
          }
        });

        el.bind('error', function() { setDefaultImage(el); });
      }
    };
});
