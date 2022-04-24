import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseApp = initializeApp({
  apiKey: "AIzaSyBCl5MzeJQtSwTPLFImwbbQ_QkcU-M3EG0",
  authDomain: "piano-d6eaf.firebaseapp.com",
  projectId: "piano-d6eaf",
  storageBucket: "piano-d6eaf.appspot.com",
  messagingSenderId: "708051164888",
  appId: "1:708051164888:web:77f7298800f639e4dd41ad",
  measurementId: "G-YQT4QB8BLD"
})

const auth = getAuth();
const firestore = getFirestore();
let firebaseUser;
const baseAudio = new Audio(`../sounds/metronome/Metronome-Click-Tick-1.mp3`)
const metronomeAudio = new Audio(`../sounds/metronome/Metronome-Click-Tick-2.mp3`)
const bpmInput = document.getElementById("bpmInput");
const metronomeButton = document.getElementById("metronomeButton");
const metronomeText = document.getElementById("metronomeText");
const timeSignature = document.getElementById("timeSignature");
const recordingButton = document.getElementById("recordingButton")
const recordedNotes = document.getElementById("recordsArray");
const playbackBttn = document.getElementById("playback");
const recNotesShown = document.getElementById("recNotesShown");
const recordingList = document.getElementById("list")
const showNotes = document.getElementById("noteName");
const showKeyboardKeys = document.getElementById("keyName");
const signOutText = document.getElementById("signOutText");
const signInText = document.getElementById("signInText");
const greetingText = document.getElementById("greetingText");
const playingNotes = document.getElementById("playingNotes");
const justABttn = document.getElementById("justABttn");

const arrayforKeys = ["w", "3", "e", "4", "r", "5", "t", "y", "7", "u", "8", "i", "z", "s", "x", "d", "c", "f", "v", "b", "h", "n", "j", "m"];
const noteNameArray = ["F", "F#", "G", "G#", "A", "Bb", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "Bb", "B", "C", "C#", "D", "D#", "E"]
const soundObj = {}

const padNumber = (num) => {
  if (num < 10) { return "0" + num; }
  else { return num; }
}

let recordList = [];
let records = [];

console.log(auth)

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
        note: noteNameArray[i],
        time: Date.now() - startTimeRecord
      }
      records.push(recObj);
    }
    playingNotes.innerHTML = noteNameArray[i];
  })
  button.addEventListener("mouseup", () => {
    sound.pause()
    sound.currentTime = 0
    if (isRecording) {
      const recObj = {
        isDown: false,
        key: `key${i + 1}`,
        note: noteNameArray[i],
        time: Date.now() - startTimeRecord
      }
      records.push(recObj);
    }
    playingNotes.innerHTML = ` `;
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
            note: noteNameArray[i],
            time: Date.now() - startTimeRecord
          }
          records.push(recObj);
        }
        playingNotes.innerHTML = noteNameArray[i];
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
          note: noteNameArray[i],
          time: Date.now() - startTimeRecord
        }
        records.push(recObj);
      }
      playingNotes.innerHTML = ` `;
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
    if (timeSignature.value === "2/4 Beat") {
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
    else if (timeSignature.value === "3/4 Beat") {
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
  if (auth.currentUser === null) {
    alert("You need to be logged in to access this feature!")
  } else if (recordList.length > 6) {
    alert("Does not support more recordings! Please delete one or more exisiting records.");
  }
  else {
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
        const notes = JSON.parse(JSON.stringify(records));
        const name = `Record ${recordList.length + 1}`;
        const dateNow = Date.now();
        const record = {
          createdAt: dateNow,
          name: name,
          notes: notes,
        }
        const firebaseRecord = {}
        firebaseRecord[`${dateNow}`] = record;
        setDoc(firebaseUser, firebaseRecord, { merge: true }).then(() => {
          fetchRecords();
        })
      }
    }
  }
})

let notesShown = false;
showNotes.addEventListener("click", () => {
  if (!notesShown) {
    for (let j = 0; j < noteNameArray.length; j++) {
      document.getElementById(`key${j + 1}`).innerHTML = noteNameArray[j];
    }
    notesShown = true;
  } else {
    for (let j = 0; j < noteNameArray.length; j++) {
      document.getElementById(`key${j + 1}`).innerHTML = "";
      notesShown = false;
    }
  }
})

let controlsShown = false;
showKeyboardKeys.addEventListener("click", () => {
  if (!controlsShown) {
    for (let j = 0; j < arrayforKeys.length; j++) {
      document.getElementById(`key${j + 1}`).innerHTML = arrayforKeys[j];
    }
    controlsShown = true;
  } else {
    for (let j = 0; j < arrayforKeys.length; j++) {
      document.getElementById(`key${j + 1}`).innerHTML = "";
      controlsShown = false;
    }
  }
})

signOutText.addEventListener("click", () => {
  if (auth.currentUser === null) {
  } else {
    signOut(auth).then(() => {
    }).catch((error) => {
      alert(error)
    });
  }
})

signInText.addEventListener("click", () => {
  window.location.href = "loginPage.html"
})

auth.onAuthStateChanged(function (user) {
  if (user) {
    greetingText.innerHTML = `Signed in as ${user.email} • `;
    signInText.style.display = "none";
    console.log(`userlogged in with user info ${user}`);
    firebaseUser = doc(firestore, `users/${user.uid}`);
    fetchRecords();
  } else {
    greetingText.innerHTML = "Joined as guest • ";
    signInText.style.display = "block";
    signOutText.style.display = "none";
  }
});



justABttn.addEventListener("click", () => {
})


const fetchRecords = async () => {
  const mySnapshot = await getDoc(firebaseUser)
  if (mySnapshot.exists()) {
    var child = recordingList.lastElementChild;
    while (child) {
      recordingList.removeChild(child);
      child = recordingList.lastElementChild;
    }
    recordList = [];
    const docData = mySnapshot.data();
    for (let key in docData) {
      const record = docData[key]
      const dateTime = new Date(record.createdAt)
      recordList.push(record);
      // console.log(record);
      const listItem = document.createElement("li")
      listItem.className = "recordItem";

      const itemName = document.createElement("span")
      itemName.innerHTML = `${record.name},  ${dateTime.toDateString('dd-MM-yyyy')} &nbsp&nbsp|`;
      listItem.appendChild(itemName)

      const itemPlayBttn = document.createElement("span")
      itemPlayBttn.innerHTML = "Play";
      itemPlayBttn.className = "recordItemPlayBttn";
      listItem.appendChild(itemPlayBttn)

      itemPlayBttn.addEventListener("click", () => {
        for (let z = 0; z < record.notes.length; z++) {
          const recObj = record.notes[z];
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

      const itemDivider = document.createElement("span")
      itemDivider.innerHTML = `&nbsp&nbsp|`;
      listItem.appendChild(itemDivider)

      const itemDeleteBttn = document.createElement("span")
      itemDeleteBttn.innerHTML = "Delete";
      itemDeleteBttn.className = "recordItemPlayBttn";
      listItem.appendChild(itemDeleteBttn)

      itemDeleteBttn.addEventListener("click", () => {
        for (let i = 0; i < recordList.length; i++) {
          if (name === recordList[i].name) {
            recordList.splice(i, 1);
          }
        }
        recordingList.removeChild(listItem)
      })
      recordingList.appendChild(listItem)
    }
  } else {
    alert('datygdauyfgvk');
  }
}