let fft;
let mic;
let startButton, playExistingButton, createRandomButton;
let audioContextStarted = false;
let sound; // Variable to store the sound file
let speedMultiplier = 6;
let gap = 12;
let maxAvgFreq = 0; // Global variable to track the maximum observed average frequency


function preload() {
  sound = loadSound('RTK.mp3');
}

function setup() {
  createCanvas(1440, 900);
  noStroke();

  fft = new p5.FFT();
  mic = new p5.AudioIn();

  startButton = createButton('Start Audio');
  startButton.position(10, height + 10);
  startButton.mousePressed(startAudio);

  // Create a button to play existing audio
  playExistingButton = createButton('Use Existing Audio');
  playExistingButton.position(startButton.width + 20, height + 10);
  playExistingButton.mousePressed(playExistingAudio);

  createRandomButton = createButton('Create Random');
  createRandomButton.position(playExistingButton.width + 50, height + 10);
  createRandomButton.mousePressed(createRandomDrawing);


}

function createRandomDrawing() {
  for (let i = 0; i < 1000; i++) {
  fill(random(255), random(255), random(255));
  rect(random(width), random(height), 50, 50);
  }
}

function startAudio() {
  if (!audioContextStarted) {
    getAudioContext().resume().then(() => {
      console.log('Audio Context resumed!');
      audioContextStarted = true;
      startButton.hide();
      playExistingButton.hide();

      mic.start(() => {
        fft.setInput(mic);
      }, (e) => {
        console.error(e);
      });
    }).catch(e => console.error(e));
  }
}

function playExistingAudio() {
  if (!audioContextStarted) {
    getAudioContext().resume().then(() => {
      console.log('Audio Context resumed!');
      audioContextStarted = true;
      startButton.hide();
      playExistingButton.hide();

      if (mic.enabled) {
        mic.stop();
        console.log('Microphone stopped');
      }

      // Set the FFT input and play the sound
      fft.setInput(sound);
      sound.loop(); // Use loop() for continuous play, replace with sound.play() for normal behavior
      console.log('Playing sound');
    }).catch(e => console.error(e));
  }
}

function draw() {
  if (audioContextStarted) {
    let spectrum = fft.analyze();
    let total = 0;
    let count = 0;

    // Debugging: Log the length of the spectrum array to ensure FFT is running
    console.log('Spectrum length:', spectrum.length);

    for (let i = 0; i < spectrum.length; i++) {
      let amplitude = spectrum[i];
      let frequency = i * (sampleRate() / 2) / spectrum.length;
      if (amplitude > 0) {
        total += frequency * amplitude * 6;
        count += amplitude;
      }
    }

    let avgFreq = count > 0 ? total / count : 0;
    
    maxAvgFreq = Math.max(maxAvgFreq, avgFreq); // Update the maximum average frequency

    let y = map(avgFreq, 0, maxAvgFreq, height, 0); // Dynamically map using the maximum average frequency
    y = constrain(y, 0, height); // Ensure y stays within the canvas bounds
    
    let x = (frameCount * speedMultiplier) % width;

    // Debugging: Log sample spectrum values and calculated average frequency
    if (frameCount % 60 === 0) { // Log once every second at 60fps
      console.log('Sample spectrum value:', spectrum[0], spectrum[Math.floor(spectrum.length / 2)]);
      console.log('Average Frequency:', avgFreq);
    }

    if (frameCount % gap === 0) {
      console.log(`Drawing at x=${x}, y=${y}`); // Debugging
      fill(random(255), random(255), random(255));
      rect(x, y, 100, 100);
    }
    
  }
}

