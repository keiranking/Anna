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
class Player {
  constructor(name, rounds) {
    this.name = name;
    this.scores = [];
    for (let i = 0; i < rounds; i++) {
      this.scores.push(null);
    }
  }

  sum() {
    let total = 0;
    for (let i = 0; i < this.scores.length; i++) {
      total += this.scores[i] < 0 ? Math.abs(this.scores[i]) * 2 : this.scores[i];
    }
    return total;
  }

}

class Leaderboard {
  constructor(players = {}) {
    this.players = players;
    console.log("New leaderboard.");
    this.publish();
  }

  ranked() {
    return Object.keys(this.players).sort(function(a, b) {
      return this.players[a].sum() - this.players[b].sum();
    }.bind(this));
  }

  publish() {
    leaderTable.innerHTML = "";
    for (let i = 0; i < this.players.list().length; i++) {
      let row = document.createElement('TR');
      row.setAttribute('data-rank', i + 1);
      let name = document.createElement('TD');
      name.classList.add('name');
      // console.log(this.ranked()[i]);
      name.innerHTML = this.players[this.ranked()[i]].name;
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

}

class Scorecard {
  constructor() {

  }

  publish() {

  }
}

class Game {
  constructor(n = 3, names = null) {
    console.log("New game.")
    this.players = {};
    this.rounds = ['333', '344', '344', '444', '3333', '3334', '3344', '3444', '4444'];
    if (names) {
      for (const name of names) {
        this.seat(name);
      }
    }
    for (let i = 0; i < n; i++) {
      this.seat();
    }

    this.publishScorecard();
    this.leaderboard = new Leaderboard(this.players);
  }

  seat(name = null) {
    const n = this.players.list().length;
    if (!name) {
      name = "Player " + (n + 1);
    }
    this.players["Player " + (n + 1)] = new Player(name, this.rounds.length);
    console.log(name + " seated.")
    // console.log(this.players["Player " + (n + 1)]);
    // console.log("Players: ", this.players.list());
  }

  renamePlayer(e) {
    console.log(this.players.list());
    let td = e.target;
    const player = td.getAttribute('data-player');
    const newName = td.innerHTML;
    this.players[player].name = newName;
    this.publishScorecard();
    this.leaderboard.publish();
    console.log(this.players.list());
  }

  getPlayerTotals() {

  }

  processScore(e) {
    let td = e.target;
    const player = td.getAttribute('data-player');
    const i = td.getAttribute('data-index');
    let score;
    switch (td.innerHTML) {
      case "":
        score = null;
        break;
      case "0":
        td.classList.add("win");
        let img = new Image();
        img.src = "images/win.svg";
        td.innerHTML = "";
        td.appendChild(img);
      case '<img src="images/win.svg">':
      case '<img src="images/double.svg">':
        score = 0;
        break;
      default:
        score = Number(td.innerHTML) || null;
        if (!score) {
          td.innerHTML = "";
        } else {
          if (td.parentNode.lastChild.firstChild.classList.contains("on")) {
            score *= -1;
          }
        }
        break;
    }
    this.players[player].scores.splice(i, 1, score);
    // console.log(this.players[player].name, this.players[player].scores);
    let playerSum = document.getElementById("sums").querySelector('[data-player="' + player + '"]');
    playerSum.innerHTML = this.players[player].sum();
    this.leaderboard.publish();
  }

  sumRound(i) {
    let total = 0;
    for (const name of this.players.list()) {
      total += this.players[name].scores[i];
    }
    return total;
  }

  publishScorecard() {
    scoreTable.innerHTML = "";

    let names = document.createElement('TR');
    let sums = document.createElement('TR');
    sums.setAttribute('id', 'sums');
    for (let j = 0; j <= this.players.list().length; j++) { // create header cells
      let name = document.createElement('TD');
      let sum = document.createElement('TD');
      if (j) {
        // console.log(this.players.list()[j - 1]);
        name.innerHTML = this.players[this.players.list()[j - 1]].name;
        name.setAttribute('contenteditable', 'true');
        name.setAttribute('data-player', this.players.list()[j - 1]);
        name.classList.add("name");
        name.addEventListener('keydown', function(e) { // prevent invalid data entry
          if (INVALID_NAME_KEYCODES.indexOf(e.which) != -1) {
            e.preventDefault();
          }
        });
        name.addEventListener('focusout', this.renamePlayer.bind(this));
        sum.innerHTML = this.players[this.players.list()[j - 1]].sum();
        sum.setAttribute('data-player', this.players.list()[j - 1]);
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
    b.innerHTML = '<i class="fas fa-user-plus fa-fw" data-fa-transform="grow-2 flip-h"></i>';
    b.setAttribute('data-tooltip', "Add player");
    b.addEventListener('click', function() {
      this.seat();
      this.publishScorecard();
      this.leaderboard.publish();
    }.bind(this));
    sumTools.appendChild(b);
    names.appendChild(nameTools);
    sums.appendChild(sumTools);
    scoreTable.appendChild(names);
    scoreTable.appendChild(sums);

    for (let i = 0; i < this.rounds.length; i++) { // create body cells
      let round = document.createElement('TR');
      const isDoubled = this.sumRound(i) < 0 ? true : false;
      for (let j = 0; j <= this.players.list().length; j++) {
        let cell = document.createElement('TD');
        if (!j) { // this is a label cell
          cell.classList.add("round");
          cell.innerHTML = this.rounds[i];
        } else { // this is a score cell
          cell.classList.add("score");
          if (isDoubled) {
            cell.classList.add("double");
          }
          cell.setAttribute('contenteditable', 'true');
          cell.setAttribute('data-player', this.players.list()[j - 1]);
          cell.setAttribute('data-index', i);
          cell.addEventListener('keydown', function(e) { // prevent invalid data entry
            if (VALID_SCORE_KEYCODES.indexOf(e.which) == -1) {
              e.preventDefault();
            }
          });
          cell.addEventListener('focusout', this.processScore.bind(this)); // push score from UI to Model, then update UI
          let sc = this.players[this.players.list()[j - 1]].scores[i];
          if (sc === 0) {
            let img = new Image();
            img.src = isDoubled ? "images/double.svg" : "images/win.svg";
            cell.appendChild(img);
            console.log("score is 0");
          } else {
            cell.innerHTML = Math.abs(sc) || "";
          }
        }
        if (j % 2){ // add stripes
          cell.classList.add("shaded");
        }
        round.appendChild(cell);
      }
      let roundTools = document.createElement('TD'); // add extra cell for buttons
      roundTools.classList.add("tools");
      roundTools.setAttribute('data-index', i);
      b = document.createElement('BUTTON');
      b.innerHTML = "&#215;2";
      b.setAttribute('data-tooltip', "Double scores");
      b.addEventListener('click', this.toggleDouble.bind(this));
      if (isDoubled) {
        b.classList.add("on");
      } else {
        b.classList.add("hidden");
      }
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

  toggleDouble(e) {
    const i = e.target.parentNode.getAttribute('data-index');
    for (const name of this.players.list()) {
      const sc = this.players[name].scores[i];
      if (sc !== null) {
        this.players[name].scores[i] *= -1;
      }
    }
    // console.log(this.players["Player 3"].scores);
    this.publishScorecard();
    this.leaderboard.publish();
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
let g = new Game(0, ["Angie", "Bobby", "Carol"]);
