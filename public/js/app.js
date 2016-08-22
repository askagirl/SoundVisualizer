(function() {
  'use strict';

var SoundcloudStream = function() {
  var self = this;
  var client_id = SOUNDCLOUD_API_KEY;
  this.sound = {};
  this.streamUrl = "";

  this.loadStream = function(track_url, successCallback, errorCallback) {
    SC.initialize({
      client_id: client_id
    });

    SC.resolve(track_url)
    .then(function(data){
      self.streamUrl = data.stream_url + '?client_id=' + client_id;
      successCallback();

    }).catch(function(error){
      errorCallback(error);
    });
  }
};

var SoundCloudAudioSource = function(audio){
  var self = this;
  var audioCtx = new (window.AudioContext || window.webkitAudioContext);
  var source = audioCtx.createMediaElementSource(audio);

  var analyser = audioCtx.createAnalyser();
  analyser.fftSize = 256;
  audio.crossOrigin = "anonymous";
  source.connect(analyser);
  analyser.connect(audioCtx.destination);

  this.bufferLength = analyser.frequencyBinCount;

  this.dataArray = new Uint8Array(this.bufferLength);

  this.playStream = function(streamUrl) {
    audio.setAttribute('src', streamUrl);
    audio.play();
  }

  this.draw = function() {
    analyser.getByteTimeDomainData(this.dataArray);
    drawCanvas(this.dataArray, this.bufferLength);
  };

}

function drawCanvas(dataArray, bufferLength){

  var data = dataArray[0];
  var v = data / 128.0;
  var y = v * two.height / 2;

  two.clear();

  var position = new Two.Vector(two.width/2, two.height/2);

  var circle = two.makeCircle(position.x, position.y, y);
  circle.fill = '#52C5DC';
  var circle2 = two.makeCircle(position.x - 1000, position.y - 1000, y);
  circle2.fill = '#FF8000';

  var circle3 = two.makeCircle(position.x + 1000, position.y + 1000 , y);
  circle3.fill = '#E77471';

  var group = two.makeGroup(circle, circle2, circle3);
  group.translation.set(two.width / 2, two.height / 2);
  group.scale = 0;
  group.noStroke();

  // Bind a function to scale and rotate the group
  // to the animation loop.
  two.bind('update', function(frameCount) {
    // This code is called everytime two.update() is called.
    // Effectively 60 times per second.
    if (group.scale > 0.9999) {
      group.scale = group.rotation = 0;
    }
    var t = (1 - group.scale) * 0.125;
    group.scale += t;
    group.rotation += t * 4 * Math.PI;
  }).play();  // Finally, start the animation loop
}

var player = document.getElementById('player');
var stream = new SoundcloudStream(player);
var audiosource = new SoundCloudAudioSource(player);
var elem = document.getElementById('visualizer');
var two = new Two({fullscreen: true}).appendTo(elem);


var play = function(trackurl) {
  stream.loadStream(trackurl,
  function() {
    audiosource.playStream(stream.streamUrl);
    setInterval(function(){ audiosource.draw() }, 1000 / 400);
  },
  function(error) {
    console.log(error);
  });
};

var track_url = 'https://soundcloud.com/bigbabydram/broccoli';
play(track_url);

}());