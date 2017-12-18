// ┌──────────────────────────────────────────────────────────────────────────┐
// │ Anna - a kalooki scorecard                                               │
// ├──────────────────────────────────────────────────────────────────────────┤
// │ Copyright © 2017 Keiran King (http://keiranking.com)                     │
// │ Licensed under the Apache License, Version 2.0.                          │
// │ (https://github.com/keiranking/Anna/blob/master/LICENSE.txt)              │
// └──────────────────────────────────────────────────────────────────────────┘

// GLOBAL CONSTANTS ├──────────────────────────────────────────────────────────

// GLOBAL DOM VARIABLES -------------------------------------------------------
let leaderboard = document.getElementById("leader-table");
let leaderTable = document.getElementById("leader-table");
let scoreTable = document.getElementById("score-table");
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
  constructor(name) {
    this.name = name;
    this.scores = [];
    console.log("New player: " + this.name + ".");
  }

  publish() { // send Player contents to UI
    //
  }
}

class Game {
  constructor(names) {
    console.log("New game.")
    this.players = {};
    this.leaderboard = [];
    if (names) {
      for (const name of names) {
        this.seat(name);
      }
      this.leaderboard = this.ranked();
    }
  }

  seat(name) {
    this.players[name] = [];
    console.log(name + " added to game.")
  }

  ranked() {
    return Object.keys(this.players).sort(function(a, b) {
      return this.players[a].sum() - this.players[b].sum();
    }.bind(this));
  }

  publish() {
    // let lb = document.createElement('TABLE');
    // lb.setAttribute('id', "leader-table");
    for (let i = 0; i < this.players.list().length; i++) {
      let row = document.createElement('TR');
      row.setAttribute('data-rank', i + 1);
      let name = document.createElement('TD');
      name.innerHTML = this.ranked()[i];
      let dist = document.createElement('TD');
      if (i > 0) {
        dist.innerHTML = "+" + (this.players[this.ranked()[0]].sum() - this.players[this.ranked()[i]].sum());
      }
      row.appendChild(name);
      row.appendChild(dist);
      leaderTable.appendChild(row);
    }
  }
}

let g = new Game(["Keiran", "Rae", "Joana", "Monique"]);
g.publish();
console.log(g.players.list(), g.leaderboard);

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

// MAIN -----------------------------------------------------------------------
// report();
