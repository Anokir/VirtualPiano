const baseAudio = new Audio(`../sounds/metronome/Metronome-Click-Tick-1.mp3`)
const metronomeAudio = new Audio(`../sounds/metronome/Metronome-Click-Tick-2.mp3`)
const bpmInput = document.getElementById("bpmInput");
const metronomeButton = document.getElementById("metronome");
const metronomeText = document.getElementById("metronomeText");
const twoByFour = document.getElementById("2/4");
const threeByFourBeat = document.getElementById("3/4");
const fourByFour = document.getElementById("4/4");
const beatSelector = document.getElementById("beatSelector");
const recordingButton = document.getElementById("recording")
const recordedNotes = document.getElementById("recordsArray");
const playbackBttn = document.getElementById("playback");
const recNotesShown = document.getElementById("recNotesShown");
const recordingList = document.getElementById("list")

const arrayforKeys = ["w", "3", "e", "4", "r", "5", "t", "y", "7", "u", "8", "i", "z", "s", "x", "d", "c", "f", "v", "b", "h", "n", "j", "m"];
const keyNameArray = ["F", "F#", "G", "G#", "A", "Bb", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "Bb", "B", "C", "C#", "D", "D#", "E"]
const soundObj = {}

const padNumber = (num) => {
  if (num < 10) { return "0" + num; }
  else { return num; }
}

let records = []

for (let i = 0; i < 24; i++) {
  const button = document.getElementById(`key${i + 1}`)
  const sound = new Audio(`../sounds/24-piano-keys/key${padNumber(i + 1)}.mp3`)
  soundObj[`key${i + 1}`] = sound

  //click events 
  button.addEventListener("mousedown", () => {
    sound.play()
    if (isRecording) {
      const recObj = {
        isDown: true,
        key: `key${i + 1}`,
        note: keyNameArray[i],
        time: Date.now() - startTimeRecord
      }
      records.push(recObj)
    }
  })
  button.addEventListener("mouseup", () => {
    sound.pause()
    sound.currentTime = 0
    if (isRecording) {
      const recObj = {
        isDown: false,
        key: `key${i + 1}`,
        note: keyNameArray[i],
        time: Date.now() - startTimeRecord
      }
      records.push(recObj)
    }
  })

  //keyPress events 
  document.addEventListener("keydown", (event) => {
    if (!event.repeat) { // !down:  down === false
      let name = event.key;
      if (name === arrayforKeys[i]) {
        sound.play();
        if (isRecording) {
          const recObj = {
            isDown: true,
            key: `key${i + 1}`,
            note: keyNameArray[i],
            time: Date.now() - startTimeRecord
          }
          records.push(recObj)
        }
      }
    }
  })
  document.addEventListener("keyup", (event) => {
    let name = event.key;
    if (name === arrayforKeys[i]) {
      sound.pause();
      sound.currentTime = 0;
      if (isRecording) {
        const recObj = {
          isDown: false,
          key: `key${i + 1}`,
          note: keyNameArray[i],
          time: Date.now() - startTimeRecord
        }
        records.push(recObj)
      }
    }
  })
}

let j = 0;
let intervalId
let alreadyPlaying = false;

//metronome
metronomeButton.addEventListener("click", (event) => {
  if (!alreadyPlaying) {
    let bpmGenerator = 60000 / (bpmInput.value);
    if (beatSelector.value === "2/4 Beat") {
      intervalId = setInterval(() => {
        if (j % 2 === 0) {
          baseAudio.currentTime = 0;
          baseAudio.play();
        }
        else {
          metronomeAudio.currentTime = 0;
          metronomeAudio.play();
        }
        j = j + 1;
      }, bpmGenerator)
    }
    else if (beatSelector.value === "3/4 Beat") {
      intervalId = setInterval(() => {
        if (j % 3 === 0) {
          baseAudio.currentTime = 0;
          baseAudio.play();
        }
        else {
          metronomeAudio.currentTime = 0;
          metronomeAudio.play();
        }
        j = j + 1;
      }, bpmGenerator)
    }
    else {
      intervalId = setInterval(() => {
        if (j % 4 === 0) {
          baseAudio.currentTime = 0;
          baseAudio.play();
        }
        else {
          metronomeAudio.currentTime = 0;
          metronomeAudio.play();
        }
        j = j + 1;
      }, bpmGenerator);
    }
    alreadyPlaying = true;
    j = 0;
    metronomeText.innerHTML = "Stop Metronome";
  }

  else {
    clearInterval(intervalId);
    alreadyPlaying = false;
    metronomeText.innerHTML = "Start Metronome";
  }
})

let startTimeRecord, stopTimeRecord;
let isRecording = false;

//recording
recordingButton.addEventListener("click", () => {
  if (!isRecording) {
    records = [];
    startTimeRecord = Date.now();
    isRecording = true;
    recordText.innerHTML = "Stop Recording";
    recordingButton.className = "button buttonStop"
  }
  else {
    stopTimeRecord = Date.now();
    console.log(stopTimeRecord - startTimeRecord)
    isRecording = false;
    recordText.innerHTML = "Start Recording"
    recordingButton.className = "button"

    if (records.length === 0) {
      alert("Empty Recording!")
    }
    else {
      const listItem = document.createElement("li")
      listItem.innerHTML = new Date()
      recordingList.appendChild(listItem)
    }
  }
})

//recordedNotes
recordedNotes.addEventListener("click", () => {
  let outputString = ""
  for (let j = 0; j < records.length; j++) {
    const recObj = records[j];
    outputString += `${recObj.isDown === true ? "\u2193" : "\u2191"}${recObj.note} `;
  }
  recNotesShown.innerHTML = outputString;
})

//playbackFunctionality
playbackBttn.addEventListener("click", () => {
  for (let z = 0; z < records.length; z++) {
    const recObj = records[z];
    setTimeout(() => {
      if (recObj.isDown) {
        soundObj[recObj.key].play();
      }
      else {
        soundObj[recObj.key].pause();
        soundObj[recObj.key].currentTime = 0;
      }
    }, recObj.time)
  }
})
