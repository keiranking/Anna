// ┌──────────────────────────────────────────────────────────────────────────┐
// │ Anna - a kalooki scorecard                                               │
// ├──────────────────────────────────────────────────────────────────────────┤
// │ Copyright © 2017 Keiran King (http://keiranking.com)                     │
// │ Licensed under the Apache License, Version 2.0.                          │
// │ (https://github.com/keiranking/Anna/blob/master/LICENSE.txt)              │
// └──────────────────────────────────────────────────────────────────────────┘

// GLOBAL CONSTANTS ├──────────────────────────────────────────────────────────
const VALID_SCORE_KEYCODES = [8, 9, 27, 37, 38, 39, 40, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57];
const INVALID_NAME_KEYCODES = [13, 186, 187, 188, 190, 191, 219, 220, 221, 222];

// GLOBAL DOM VARIABLES -------------------------------------------------------
let leaderboard = document.getElementById("leaderboard");
let leaderHeader = document.getElementById("lb-header");
let leaderTable = document.getElementById("lb-table");
let scorecard = document.getElementById("scorecard");
let scoreTable = document.getElementById("sc-table");
let buttonToggleSc = document.getElementById("toggle-sc");
let note = null;

// DATA TYPE FUNCTIONS --------------------------------------------------------
Number.prototype.random = function(n, p = 0) { // return random number in range
  return n > p ? Math.floor(Math.random() * (n - p)) + p : Math.floor(Math.random() * (p - n)) + n;
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

Array.prototype.sum = function() { // return sum of array elements
  let sum = 0;
  for (let i = 0; i < this.length; i++) {
    sum += this[i];
  }
  return sum;
}

Object.prototype.list = function() {
  return Object.keys(this);
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
class Game {
  constructor(names) {
    console.log("New game.")
    this.players = {};
    this.leaderboard = [];
    this.rounds = ['333', '344', '344', '444', '3333', '3334', '3344', '3444', '4444'];
    if (names) {
      for (const name of names) {
        this.seat(name);
      }
      this.leaderboard = this.ranked();
    }
    this.publishScorecard();
    this.publishLeaderboard();
  }

  seat(name) {
    this.players[name] = [];
    for (let i = 0; i < this.rounds.length; i++) {
      // this.players[name].push((0).random(180));
      this.players[name].push(null);
    }
    console.log(name + " added to game.")
  }

  ranked() {
    return Object.keys(this.players).sort(function(a, b) {
      return this.players[a].sum() - this.players[b].sum();
    }.bind(this));
  }

  publishLeaderboard() {
    // Update leaderboard
    leaderTable.innerHTML = "";
    for (let i = 0; i < this.players.list().length; i++) {
      let row = document.createElement('TR');
      row.setAttribute('data-rank', i + 1);
      let name = document.createElement('TD');
      name.classList.add('name');
      name.innerHTML = this.ranked()[i];
      let dist = document.createElement('TD');
      dist.setAttribute('class', 'distance');
      if (i > 0) {
        dist.innerHTML = "+" + (this.players[this.ranked()[i]].sum() - this.players[this.ranked()[0]].sum());
      }
      row.appendChild(name);
      row.appendChild(dist);
      leaderTable.appendChild(row);
    }
    document.getElementById("date").innerHTML = moment().format('D MMM YYYY');
    leaderboard.style.minHeight = scorecard.clientHeight < 480 ? 480 : scorecard.clientHeight;
    console.log("Leaderboard published.");
  }

  publishScorecard() {
    scoreTable.innerHTML = "";

    let names = document.createElement('TR');
    let sums = document.createElement('TR');
    for (let j = 0; j <= this.players.list().length; j++) { // create header cells
      let name = document.createElement('TD');
      let sum = document.createElement('TD');
      if (j) {
        name.innerHTML = this.players.list()[j - 1];
        name.setAttribute('contenteditable', 'true');
        name.classList.add("name");
        name.addEventListener('keydown', function(e) { // prevent invalid data entry
          if (INVALID_NAME_KEYCODES.indexOf(e.which) != -1) {
            e.preventDefault();
          }
        });
        sum.innerHTML = this.players[this.players.list()[j - 1]].sum();
        sum.classList.add("sum");
      }
      if (j % 2){ // add stripes
        name.classList.add("shaded");
        sum.classList.add("shaded");
      }
      names.appendChild(name);
      sums.appendChild(sum);
    }
    let nameTools = document.createElement('TD'); // add extra cell for buttons
    nameTools.classList.add("tools");
    let sumTools = document.createElement('TD'); // add extra cell for buttons
    sumTools.classList.add("tools");
    let b = document.createElement('BUTTON');
    b.innerHTML = '<i class="fas fa-plus fa-fw"></i>';
    sumTools.appendChild(b);
    names.appendChild(nameTools);
    sums.appendChild(sumTools);
    scoreTable.appendChild(names);
    scoreTable.appendChild(sums);

    for (let i = 0; i < this.rounds.length; i++) { // create body cells
      let round = document.createElement('TR');
      for (let j = 0; j <= this.players.list().length; j++) {
        let cell = document.createElement('TD');
        if (!j) { // this is a label cell
          cell.classList.add("round");
          cell.innerHTML = this.rounds[i];
        } else { // this is a score cell
          cell.classList.add("score");
          cell.setAttribute('contenteditable', 'true');
          cell.setAttribute('data-player', this.players.list()[j - 1]);
          cell.setAttribute('data-index', i);
          cell.addEventListener('keydown', function(e) { // prevent invalid data entry
            if (VALID_SCORE_KEYCODES.indexOf(e.which) == -1) {
              e.preventDefault();
            }
          });
          cell.addEventListener('focusout', function(e) { // push score from UI to Model, then update UI
            let td = e.target;
            const player = td.getAttribute('data-player');
            const i = td.getAttribute('data-index');
            const score = td.innerHTML === "" ? null : new Number(td.innerHTML);
            this.players[player].splice(i, 1, score);
            this.publishScorecard();
            this.publishLeaderboard();
          }.bind(this));
          cell.innerHTML = this.players[this.players.list()[j - 1]][i] || "";
        }
        if (j % 2){ // add stripes
          cell.classList.add("shaded");
        }
        round.appendChild(cell);
      }
      let roundTools = document.createElement('TD'); // add extra cell for buttons
      roundTools.classList.add("tools");
      b = document.createElement('BUTTON');
      b.innerHTML = "&#215;2";
      b.classList.add("hidden");
      roundTools.appendChild(b);
      round.appendChild(roundTools);
      round.addEventListener('mouseover', function() {
        round.lastChild.firstChild.classList.remove("hidden");
      });
      round.addEventListener('mouseout', function() {
        if (!round.lastChild.firstChild.classList.contains("on")) {
          round.lastChild.firstChild.classList.add("hidden");
        }
      });
      scoreTable.appendChild(round);
    }
    console.log("Scorecard published.");
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
function show(content) {
  if (note) {
    note.dismiss();
  }
  note = new Notification(document.getElementById(content).innerHTML);
}

function takePhoto() {
  html2canvas(document.getElementById("main")).then(function(canvas) {
    document.body.appendChild(canvas);
});
}

function toggleScorecard() {
  scorecard.classList.toggle("hidden");
  leaderboard.classList.toggle("open");
  leaderHeader.classList.toggle("open");
  buttonToggleSc.classList.toggle("on");
  buttonToggleSc.innerHTML = buttonToggleSc.classList.contains("on") ?
    '<i class="far fa-eye-slash fa-fw"></i>' : '<i class="fas fa-eye fa-fw"></i>';
}

// MAIN -----------------------------------------------------------------------
let g = new Game(["Keiran", "Rae", "Joana", "Monique", "Dan"]);
