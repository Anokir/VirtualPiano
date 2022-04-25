import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, deleteField, updateDoc } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

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
const recordingList = document.getElementById("list")
const showNotes = document.getElementById("noteName");
const showKeyboardKeys = document.getElementById("keyName");
const signOutText = document.getElementById("signOutText");
const signInText = document.getElementById("signInText");
const greetingText = document.getElementById("greetingText");
const playingNotes = document.getElementById("playingNotes");
const loadingContainer = document.getElementById("loadingContainer");
const timerBttn = document.getElementById("timerBttn");

const arrayforKeys = ["w", "3", "e", "4", "r", "5", "t", "y", "7", "u", "8", "i", "z", "s", "x", "d", "c", "f", "v", "b", "h", "n", "j", "m"];
const noteNameArray = ["F", "F#", "G", "G#", "A", "Bb", "B", "C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "Bb", "B", "C", "C#", "D", "D#", "E"]
const soundObj = {}
let recObj = {};
let recordList = [];
let records = [];
let recordName;

timerBttn.style.display = "none";

const padNumber = (num) => {
  if (num < 10) { return "0" + num; }
  else { return num; }
}

const showLoading = () => {
  loadingContainer.style.display = `flex`;
}

const hideLoading = () => {
  loadingContainer.style.display = `none`;
}

let startTimeRecord, stopTimeRecord;
let isRecording = false;
let timerInterval;

const recordingFunction = () => {
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
      recordingButton.className = "button buttonStop";

      timerBttn.style.display = "block";
      timerBttn.innerHTML = `00:00`;
      let timerValue = 0;
      timerInterval = setInterval(() => {
        ++timerValue;
        let seconds = padNumber(timerValue % 60);
        let minutes = padNumber(parseInt(timerValue / 60));
        timerBttn.innerHTML = `${minutes}:${seconds}`;
      }, 1000);
    }
    else {
      stopTimeRecord = Date.now();
      console.log(stopTimeRecord - startTimeRecord);
      isRecording = false;
      recordText.innerHTML = "Start Recording";
      recordingButton.className = "button";
      clearInterval(timerInterval);

      if (records.length === 0) {
        alert("Empty Recording!")
        timerBttn.innerHTML = `00:00`;
        return;
      }
      recordName = prompt(`Enter your piece name here:`)
      if (recordName === null) {
        alert("You've cancelled saving the record!");
        timerBttn.innerHTML = `00:00`;
        return;
      }
      while (recordName.length === 0) {
        recordName = prompt(`Name is required. Please enter the name!`)
        if (recordName === null) {
          alert("You've cancelled saving the record!");
          timerBttn.innerHTML = `00:00`;
          return;
        }
      }
      if (recordName.length > 20) {
        recordName = recordName.substring(0, 20);
      }
      const notes = JSON.parse(JSON.stringify(records));
      const name = recordName;
      const dateNow = Date.now();
      const record = {
        createdAt: dateNow,
        name: name,
        notes: notes,
      }
      showLoading();
      const firebaseRecord = {}
      firebaseRecord[`${dateNow}`] = record;
      setDoc(firebaseUser, firebaseRecord, { merge: true }).then(() => {
        fetchRecords();
      }).catch((error) => {
        alert(error);
        hideLoading();
      })
    }
  }
}

const deleteAllInnerHtmlText = () => {
  var child = recordingList.lastElementChild;
  while (child) {
    recordingList.removeChild(child);
    child = recordingList.lastElementChild;
  }
}

for (let i = 0; i < 24; i++) {
  const button = document.getElementById(`key${i + 1}`)
  const sound = new Audio(`../sounds/24-piano-keys/key${padNumber(i + 1)}.mp3`)
  soundObj[`key${i + 1}`] = sound

  //click events 
  button.addEventListener("mousedown", () => {
    sound.play()
    if (isRecording) {
      recObj = {
        isDown: true,
        key: `key${i + 1}`,
        note: noteNameArray[i],
        time: Date.now() - startTimeRecord
      }
      if (records.length > 199) {
        alert(`Unable to record more notes due to firebase restrictions`);
        recordingFunction();
      } else {
        records.push(recObj);
      }
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
      if (records.length > 199) {
        alert(`Unable to record more notes due to firebase restrictions`);
        recordingFunction();
      } else {
        records.push(recObj);
      }
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
          if (records.length > 199) {
            alert(`Unable to record more notes due to firebase restrictions`);
            recordingFunction();
          } else {
            records.push(recObj);
          }
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
        if (records.length > 199) {
          alert(`Unable to record more notes due to firebase restrictions`);
          recordingFunction();
        } else {
          records.push(recObj);
        }
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
          console.log(records)
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


//recording
recordingButton.addEventListener("click", recordingFunction);

// let notesShown = false;
// showNotes.addEventListener("click", () => {
//   if (!notesShown) {
//     for (let j = 0; j < noteNameArray.length; j++) {
//       document.getElementById(`key${j + 1}`).innerHTML += noteNameArray[j];
//     }
//     notesShown = true;
//   } else {
//     for (let j = 0; j < noteNameArray.length; j++) {
//       document.getElementById(`key${j + 1}`).innerHTML = "";
//       notesShown = false;
//     }
//   }
// })

// let controlsShown = false;
// showKeyboardKeys.addEventListener("click", () => {
//   if (!controlsShown) {
//     for (let j = 0; j < arrayforKeys.length; j++) {
//       document.getElementById(`key${j + 1}`).innerHTML += arrayforKeys[j];
//     }
//     controlsShown = true;
//   } else {
//     for (let j = 0; j < arrayforKeys.length; j++) {
//       document.getElementById(`key${j + 1}`).innerHTML = "";
//       controlsShown = false;
//     }
//   }
// })

let notesShown = false;
let controlsShown = false;

showNotes.addEventListener("click", () => {
  if (!notesShown && !controlsShown) {
    for (let j = 0; j < noteNameArray.length; j++) {
      document.getElementById(`key${j + 1}`).innerHTML = noteNameArray[j];
    }
    notesShown = true;
  } else if (!notesShown && controlsShown) {
    for (let j = 0; j < noteNameArray.length; j++) {
      document.getElementById(`key${j + 1}`).innerHTML = noteNameArray[j] + "<br />" + arrayforKeys[j];
      notesShown = true;
    }
  } else if (notesShown && controlsShown) {
    for (let j = 0; j < noteNameArray.length; j++) {
      document.getElementById(`key${j + 1}`).innerHTML = arrayforKeys[j];
      notesShown = false;
    }
  } else {
    for (let j = 0; j < noteNameArray.length; j++) {
      document.getElementById(`key${j + 1}`).innerHTML = "";
      notesShown = false;
    }
  }
})

showKeyboardKeys.addEventListener("click", () => {
  if (!notesShown && !controlsShown) {
    for (let j = 0; j < arrayforKeys.length; j++) {
      document.getElementById(`key${j + 1}`).innerHTML = arrayforKeys[j];
    }
    controlsShown = true;
  } else if (notesShown && !controlsShown) {
    for (let j = 0; j < arrayforKeys.length; j++) {
      document.getElementById(`key${j + 1}`).innerHTML = noteNameArray[j] + "<br />" + arrayforKeys[j];
      controlsShown = true;
    }
  } else if (notesShown && controlsShown) {
    for (let j = 0; j < arrayforKeys.length; j++) {
      document.getElementById(`key${j + 1}`).innerHTML = noteNameArray[j];
      controlsShown = false;
    }
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
    firebaseUser = doc(firestore, `users/${user.uid}`);
    fetchRecords();
  } else {
    greetingText.innerHTML = "Joined as guest • ";
    signInText.style.display = "block";
    signOutText.style.display = "none";
    recordList = [];
    deleteAllInnerHtmlText();
    hideLoading();
  }
});

const fetchRecords = async () => {
  showLoading();
  const mySnapshot = await getDoc(firebaseUser)
  if (mySnapshot.exists()) {
    deleteAllInnerHtmlText();
    recordList = [];
    const docData = mySnapshot.data();
    for (let key in docData) { 
      const record = docData[key]
      const dateTime = new Date(record.createdAt)

      const itemDividerFunction = () => {
        const itemDivider = document.createElement("span")
        itemDivider.innerHTML = "&nbsp&nbsp|";
        listItem.appendChild(itemDivider);
      }

      recordList.push(record);
      const listItem = document.createElement("li")
      listItem.className = "recordItem";

      const itemName = document.createElement("span")
      itemName.innerHTML = `${record.name},  ${dateTime.toDateString('dd-MM-yyyy')} `;
      listItem.appendChild(itemName);

      itemDividerFunction();
      const formatDateSetter = document.createElement("span")
      formatDateSetter.innerHTML = ` ${dateTime.toTimeString().split(` `)[0]} `;
      listItem.appendChild(formatDateSetter);

      itemDividerFunction();
      const itemPlayBttn = document.createElement("span")
      itemPlayBttn.innerHTML = " Play ";
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

      itemDividerFunction();
      const itemDeleteBttn = document.createElement("span")
      itemDeleteBttn.innerHTML = "Delete";
      itemDeleteBttn.className = "recordItemPlayBttn";
      listItem.appendChild(itemDeleteBttn)

      itemDeleteBttn.addEventListener("click", () => {
        const isDeleted = confirm(`Are you sure to delete ${record.name}?`)
        if (isDeleted) {
          showLoading();
          const deleteFirebaseField = {}
          deleteFirebaseField[`${record.createdAt}`] = deleteField();
          updateDoc(firebaseUser, deleteFirebaseField).then(() => {
            console.log(`success`);
            fetchRecords();
          }).catch((error) => {
            alert(error);
            hideLoading();
          })
        }
      })
      recordingList.appendChild(listItem)
    }
  } else {
    alert('Could not fecth records!');
  }
  hideLoading();
}



