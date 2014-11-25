'use strict';

angular.module('musicBucketApp')
  .controller('MainCtrl', function ($scope, $http, socket) {
                $scope.awesomeThings = [];
                /* TMP Player mock*/
                $scope.player = {
                  isPlaying : true,
                  togglePlay : null,
                  progress: {current: "33%", buffered: "79%"},
                  playerProgressClickEvent : function(event) {
                    $scope.player.progress.current = Math.round(event.offsetX / event.currentTarget.firstChild.clientWidth * 100) + "%";
                    //$scope.$apply();
                  },
                  currentTrack: {
                    artist  : 'Coyote Kisses',
                    title   : 'Diving at Night',
                    albumArt: 'http://images.huffingtonpost.com/2013-05-13-ckthundercolorweblg.jpg'
                  },
                  nextTrack: {shortDescription: "What So Not - High You Are (Branchez remix)"},
                  playlist: {entries : [
                    {shortDescription: "Dillon Francis - Bootleg Fireworks"},
                    {shortDescription: "Flume - Change"},
                    {shortDescription: "Flume - Sleepless"},
                    {shortDescription: "Gramatik - Torture"},
                    {shortDescription: "GRiZ - Smash the Funk"},
                    {shortDescription: "GRiZ - The Future Is Now"},
                    {shortDescription: "GRiZ - Wonder Why"},
                    {shortDescription: "Le Youth - Cool"},
                    {shortDescription: "Lorde - Tenis Court"},
                    {shortDescription: "Porter Robinson - Years of War (feat. Breanne Duren & Sean Caskey)"}
                  ]}
                };
                $scope.player.togglePlay = _.bind(function() {
                  console.log("playing: "+this.isPlaying);
                  this.isPlaying = !this.isPlaying;}, $scope.player);

                $http.get('/api/things').success(function (awesomeThings) {
                  $scope.awesomeThings = awesomeThings;
                  socket.syncUpdates('thing', $scope.awesomeThings);
                });

                $scope.addThing = function () {
                  if ($scope.newThing === '') {
                    return;
                  }
                  $http.post('/api/things', {name: $scope.newThing, info: $scope.newThingTip});
                  $scope.newThing = '';
                  $scope.newThingTip = '';
                };

                $scope.deleteThing = function (thing) {
                  $http.delete('/api/things/' + thing._id);
                };

                $scope.$on('$destroy', function () {
                  socket.unsyncUpdates('thing');
                });
              });
