/* ==========================================================================
   AviLation: js/seats.js
   seats.html: draws the seat map, lets the passenger pick seats, and saves
   the reservation to booking history.
   Needs js/common.js loaded first.

   The markup it writes into #planeBody matches css/style.css:
     .row > .seat (.available / .taken / .selected) + .row-label
   ========================================================================== */
(function () {
  'use strict';

  var AL = window.AviLation;
  var planeBody = document.getElementById('planeBody');
  if (!planeBody || !AL) { return; }

  var summaryEl = document.getElementById('flightSummary');
  var nameInput = document.getElementById('fullname');
  var seatInput = document.getElementById('chosenSeat');
  var submitBtn = document.getElementById('submitBtn');
  var msg = document.getElementById('seatsMsg');
  var form = document.getElementById('reserveForm');

  var LETTERS_LEFT = ['A', 'B', 'C'];
  var LETTERS_RIGHT = ['D', 'E', 'F'];
  var ROWS_BY_CABIN = { 'Economy': 24, 'Premium Economy': 14, 'Business': 8, 'First': 4 };

  var draft = AL.read(AL.KEYS.draft, null);
  var selected = [];

  /* ---------- start: no trip yet ---------- */
  if (!draft) {
    AL.showMessage(msg, 'error', 'There is no trip to pick seats for yet. Fill in the booking form first.');
    submitBtn.disabled = true;
    var back = document.createElement('a');
    back.href = 'booking.html';
    back.className = 'btn';
    back.textContent = 'Go to booking';
    back.style.marginTop = '16px';
    msg.insertAdjacentElement('afterend', back);
    return;
  }

  var session = AL.getSession();
  var passengerName = session && session.fullname ? session.fullname : 'Guest';
  nameInput.value = passengerName;

  /* ---------- trip summary ---------- */
  function addSummary(label, value) {
    var span = document.createElement('span');
    if (label) {
      var strong = document.createElement('strong');
      strong.textContent = label;
      span.appendChild(strong);
      span.appendChild(document.createTextNode(' ' + value));
    } else {
      span.textContent = value;
    }
    summaryEl.appendChild(span);
  }

  summaryEl.textContent = '';
  addSummary(draft.fromCode, 'to ');
  summaryEl.lastChild.appendChild(Object.assign(document.createElement('strong'), { textContent: draft.toCode }));
  addSummary('', AL.formatDate(draft.date));
  addSummary('', draft.passengers + (draft.passengers === 1 ? ' passenger' : ' passengers'));
  addSummary('', draft.cabin);

  /* ---------- which seats are taken ---------- */
  function flightKey(trip) {
    return [trip.fromCode, trip.toCode, trip.date, trip.cabin].join('|').toLowerCase();
  }

  /* Same flight always gives the same "taken" pattern. */
  function seededRandom(text) {
    var h = 1779033703 ^ text.length;
    for (var i = 0; i < text.length; i++) {
      h = Math.imul(h ^ text.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    var a = h >>> 0;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var key = flightKey(draft);
  var rand = seededRandom(key);
  var rowCount = ROWS_BY_CABIN[draft.cabin] || 24;
  var taken = {};

  for (var r = 1; r <= rowCount; r++) {
    LETTERS_LEFT.concat(LETTERS_RIGHT).forEach(function (letter) {
      if (rand() < 0.28) { taken[r + letter] = true; }
    });
  }

  /* Seats this browser already reserved on the same flight are taken too. */
  AL.read(AL.KEYS.history, []).forEach(function (b) {
    if (flightKey(b) === key) {
      (b.seats || []).forEach(function (s) { taken[s] = true; });
    }
  });

  /* ---------- draw the map ---------- */
  var seatButtons = {};

  function makeSeat(row, letter) {
    var id = row + letter;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'seat ' + (taken[id] ? 'taken' : 'available');
    btn.textContent = letter;
    btn.setAttribute('data-seat', id);
    btn.setAttribute('aria-label', 'Seat ' + id + (taken[id] ? ', taken' : ', available'));
    btn.setAttribute('aria-pressed', 'false');
    btn.disabled = !!taken[id];
    seatButtons[id] = btn;
    return btn;
  }

  planeBody.textContent = '';
  for (var row = 1; row <= rowCount; row++) {
    var rowEl = document.createElement('div');
    rowEl.className = 'row';
    LETTERS_LEFT.forEach(function (l) { rowEl.appendChild(makeSeat(row, l)); });
    var label = document.createElement('span');
    label.className = 'row-label';
    label.textContent = row;
    rowEl.appendChild(label);
    LETTERS_RIGHT.forEach(function (l) { rowEl.appendChild(makeSeat(row, l)); });
    planeBody.appendChild(rowEl);
  }

  /* ---------- picking seats ---------- */
  function refresh() {
    seatInput.value = selected.join(', ');
    submitBtn.disabled = selected.length !== draft.passengers;
    submitBtn.textContent = selected.length === draft.passengers
      ? 'Reserve Seat' + (draft.passengers > 1 ? 's' : '')
      : 'Reserve Seat' + (draft.passengers > 1 ? 's' : '') + ' (' + selected.length + '/' + draft.passengers + ')';
  }

  planeBody.addEventListener('click', function (event) {
    var btn = event.target.closest('.seat');
    if (!btn || btn.disabled) { return; }
    var id = btn.getAttribute('data-seat');
    var at = selected.indexOf(id);
    AL.clearMessage(msg);

    if (at > -1) {
      selected.splice(at, 1);
      btn.classList.remove('selected');
      btn.classList.add('available');
      btn.setAttribute('aria-pressed', 'false');
    } else {
      if (selected.length >= draft.passengers) {
        AL.showMessage(msg, 'error',
          'You booked for ' + draft.passengers + (draft.passengers === 1 ? ' passenger' : ' passengers') +
          '. Tap a selected seat to release it first.');
        return;
      }
      selected.push(id);
      btn.classList.remove('available');
      btn.classList.add('selected');
      btn.setAttribute('aria-pressed', 'true');
    }
    refresh();
  });

  /* ---------- reserve ---------- */
  function makeReference() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    var out = '';
    for (var i = 0; i < 6; i++) { out += chars.charAt(Math.floor(Math.random() * chars.length)); }
    return 'AVL-' + out;
  }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    if (selected.length !== draft.passengers) {
      AL.showMessage(msg, 'error', 'Choose ' + draft.passengers + (draft.passengers === 1 ? ' seat' : ' seats') + ' to continue.');
      return;
    }

    var booking = {
      ref: makeReference(),
      status: 'Confirmed',
      from: draft.from,
      to: draft.to,
      fromCode: draft.fromCode,
      toCode: draft.toCode,
      date: draft.date,
      cabin: draft.cabin,
      passengers: draft.passengers,
      passengerName: passengerName,
      seats: selected.slice(),
      bookedAt: new Date().toISOString()
    };

    var history = AL.read(AL.KEYS.history, []);
    history.push(booking);
    if (!AL.write(AL.KEYS.history, history)) {
      AL.showMessage(msg, 'error', 'Your browser would not save the reservation. Check that storage is not blocked and try again.');
      return;
    }
    AL.remove(AL.KEYS.draft);

    submitBtn.disabled = true;
    AL.showMessage(msg, 'success', 'Reserved. Your booking reference is ' + booking.ref + '. Opening your booking history...');
    window.setTimeout(function () { window.location.href = 'history.html'; }, 1400);
  });

  refresh();
})();
