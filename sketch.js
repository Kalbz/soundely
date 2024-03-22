let fft;
let mic;
let startButton;
let audioContextStarted = false; // Flag to track audio context state
let speedMultiplier = 6; // Increase this to make the visualization move faster
let gap = 12; // Draw a rectangle every 'gap' frames

function preload() {
  // Load a sound file
  sound = loadSound('RTK.mp3');
}

function setup() {
  createCanvas(1440, 900);
  noStroke();

  // Initialize FFT and microphone without starting them
  fft = new p5.FFT();
  mic = new p5.AudioIn();

  // Create a start button for user interaction
  startButton = createButton('Start Audio');
  startButton.position(10, height + 10); // Position it below the canvas
  startButton.mousePressed(startAudio); // Specify function to call on press

  
}

function startAudio() {
  if (!audioContextStarted) {
    // Explicitly resume the audio context if needed
    getAudioContext().resume().then(() => {
      console.log('Audio Context resumed!');
      audioContextStarted = true;
      startButton.hide(); // Hide the start button after audio has started
      
      // Start microphone input and set FFT input
      mic.start(() => {
        // Microphone started
        fft.setInput(mic);
      }, (e) => {
        console.error(e); // Log error if microphone doesn't start
      });
    }).catch(e => console.error(e));
  }
}
function draw() {
  let spectrum = fft.analyze();
  let total = 0;
  let count = 0;

  for (let i = 0; i < spectrum.length; i++) {
    let amplitude = spectrum[i];
    // Calculating the frequency for the current bin
    let frequency = i * (sampleRate() / 2) / spectrum.length;
    if (amplitude > 0) {
      total += frequency * amplitude * 6;
      count += amplitude;
    }
  }
  
  let avgFreq = count > 0 ? total / count : 0;
  // Adjust the mapping range to limit how low the rectangles can go
  // For example, mapping to the upper half or a third of the canvas
  let y = map(avgFreq, 0, sampleRate() / 2, height, 0);

  
  let x = (frameCount * speedMultiplier) % width;

  // Draw a rectangle only on specific frames to introduce gaps
  if (frameCount % gap === 0) {
    // Randomize the color
    fill(random(255), random(255), random(255));
    rect(x, y, 100, 100); // Drawing the rectangle
  }
}


