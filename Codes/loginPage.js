import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseApp = initializeApp({
  apiKey: "AIzaSyBCl5MzeJQtSwTPLFImwbbQ_QkcU-M3EG0",
  authDomain: "piano-d6eaf.firebaseapp.com",
  projectId: "piano-d6eaf",
  storageBucket: "piano-d6eaf.appspot.com",
  messagingSenderId: "708051164888",
  appId: "1:708051164888:web:77f7298800f639e4dd41ad",
  measurementId: "G-YQT4QB8BLD"
})

const auth = getAuth(firebaseApp);
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signInBttn = document.getElementById("signInBttn");
const signUpBttn = document.getElementById("signUpBttn");
const createAccountText = document.getElementById("createAccountText");

let isSignIn = true;

const getTextInput = (input) => {
  return input.value
}

signInBttn.addEventListener("click", () => {
  signInWithEmailAndPassword(auth, getTextInput(emailInput), getTextInput(passwordInput))
    .then(() => {
      window.location.href = "piano2.html";
    })
    .catch((error) => {
      alert(error.message);
    });
  signInBttn.style.pointerEvents = 'none';
})



signUpBttn.addEventListener("click", () => {
  createUserWithEmailAndPassword(auth, getTextInput(emailInput), getTextInput(passwordInput))
    .then((userCredential) => {
      const user = userCredential.user;
    })
    .catch((error) => {
      alert(error.message);
      // ..
    });
  signUpBttn.style.pointerEvents = 'none';
})

signUpBttn.style.display = 'none';

createAccountText.addEventListener("click", () => {
  if (isSignIn) {
    signUpBttn.style.display = 'block';
    signInBttn.style.display = 'none';
    createAccountText.innerHTML = "Sign-In";
    isSignIn = false;
  }
  else {
    signUpBttn.style.display = 'none';
    signInBttn.style.display = 'block';
    createAccountText.innerHTML = "Create new account";
    isSignIn = true;
  }
})