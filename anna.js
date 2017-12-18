// ┌──────────────────────────────────────────────────────────────────────────┐
// │ Anna - a kalooki scorecard                                               │
// ├──────────────────────────────────────────────────────────────────────────┤
// │ Copyright © 2017 Keiran King (http://keiranking.com)                     │
// │ Licensed under the Apache License, Version 2.0.                          │
// │ (https://github.com/keiranking/Eve/blob/master/LICENSE.txt)              │
// └──────────────────────────────────────────────────────────────────────────┘

// GLOBAL CONSTANTS ├──────────────────────────────────────────────────────────

// GLOBAL DOM VARIABLES -------------------------------------------------------
let leaderTable = document.getElementById("leader-table");
let scoreTable = document.getElementById("score-table");
let note = null;

// DATA TYPE FUNCTIONS --------------------------------------------------------
Number.prototype.random = function() { // return random number between 0 and the number (exclusive)
  return Math.floor(Math.random() * this);
}

Array.prototype.pluck = function(n = 1) { // return random item, which is deleted from array
  let list = [];
  for (let i = 0; i < n; i++) {
    const index = this.length.random();
    list.push(this[index]);
    this.splice(index, 1);
  }
  return list.length == 1 ? list[0] : list;
}

Array.prototype.random = function() { // return random item from array
  return this[this.length.random()];
}

Object.prototype.randomKey = function() { // return random key from dictionary
  return Object.keys(this).random();
}

Object.prototype.flatten = function() { // return flattened array of all nested items in dictionary
  let array = [];
  let keys = Object.keys(this);
  for (i = 0; i < keys.length; i++) {
    array = array.concat(this[keys[i]]);
  }
  return array;
}

// CLASSES --------------------------------------------------------------------
class Card {
  constructor() {
    this.letter = ALPHABET.random();
    this.list = this.select();
    console.log("New card.");
    this.publish();
  }

  select(n = NO_OF_CATEGORIES) { // populate categories
    let cats = CATEGORIES.slice(0);
    switch (localization) {
      case "all":
        cats = cats.concat(LOCAL_CATEGORIES.flatten());
        break;
      case "none":
        break;
      default:
        cats = cats.concat(LOCAL_CATEGORIES[localization]);
        break;
    }
    return cats.pluck(n);
  }

  publish() { // send Card contents to UI
    categories.innerHTML = "";
    let ol = document.createElement("OL");
    for (let i = 0; i < this.list.length; i++) {
      let li = document.createElement("LI");
      li.innerHTML = this.list[i];
      if (i == this.list.length - 1) {
        li.classList.add("last"); // remove border from last category
      }
      ol.appendChild(li);
    }
    categories.appendChild(ol);

    card.classList.toggle("tilt-left");
    card.classList.toggle("tilt-right");

    letter.innerHTML = this.letter;
  }
}

class Timer {
  constructor(seconds = ROUND_DURATION) {
    this.secs = seconds;
    this.id = null;
    this.publish();
  }

  toggle() {
    clearInterval(this.id);
    if (this.id) {
      console.log("Timer paused.");
      this.id = null;
      return;
    }
    console.log("Timer on.");
    this.id = setInterval(this.tick.bind(this), 1000); // setInterval inside a class needs .bind(this) to work
  }

  reset() {
    clearInterval(this.id);
    this.id = null;
    this.secs = ROUND_DURATION;
    this.publish();
    console.log("Timer reset.");
  }

  tick() {
    this.secs--;
    if (this.secs < 0) {
      this.reset();
      return;
    }
    if (this.secs == 0) {
      audio.play();
    }
    this.publish();
  }

  publish() {
    if (this.secs <= WARNING_TIME) {
      timer.classList.add("warning");
    } else {
      timer.classList.remove("warning");
    }
    timer.innerHTML = this.secs.toTimeString();
  }
}

class Notification {
  constructor(message, lifetime = undefined) {
    this.message = message;
    this.id = (100000).random().toString();
    this.post();
    if (lifetime) {
      this.dismiss(lifetime);
    }
  }

  post() {
    let div = document.createElement("DIV");
    div.setAttribute("id", this.id);
    div.setAttribute("class", "notification");
    div.innerHTML = this.message;
    div.addEventListener('click', this.dismiss);
    document.getElementById("notebar").appendChild(div);
  }

  update(message) {
    document.getElementById(this.id).innerHTML = message;
  }

  dismiss(seconds = 0) {
    let div = document.getElementById(this.id);
    setTimeout(function() { div.remove(); }, seconds * 1000);
  }
}

// FUNCTIONS ------------------------------------------------------------------
function startNewRound() {
  new Card();
  t.reset();
  t.toggle();
}

function toggleTimer() {
  t.toggle();
}

function resetTimer() {
  t.reset();
}

function initializeLocalizations() {
  let l = document.getElementById("localization");
  let keys = Object.keys(LOCAL_CATEGORIES);
  keys.push("World");
  for (let i = 0; i < keys.length; i++) {
    let option = document.createElement("OPTION");
    option.value = keys[i];
    option.innerHTML = keys[i];
    l.appendChild(option);
  }
  l.value = "World";
}

function report() {
  let generic = CATEGORIES.length;
  let local = LOCAL_CATEGORIES.flatten().length;
  console.log("Categories: " + generic + " generic, " + local + " local, " + (generic + local) + " total.");
}

function setLocalization() {
  localization = document.getElementById("localization").value;
  console.log("Localization: " + localization + ".");
}

function show(content) {
  if (note) {
    note.dismiss();
  }
  note = new Notification(document.getElementById(content).innerHTML);
}

// MAIN -----------------------------------------------------------------------
report();
initializeLocalizations();
setLocalization();
let t = new Timer();
new Card();
