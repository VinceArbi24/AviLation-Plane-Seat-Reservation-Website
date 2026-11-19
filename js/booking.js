/* ==========================================================================
   AviLation: js/booking.js
   booking.html: checks the trip form, saves it, then opens seats.html.
   Needs js/common.js loaded first.
   ========================================================================== */
(function () {
  'use strict';

  var AL = window.AviLation;
  var form = document.getElementById('bookingForm');
  if (!form || !AL) { return; }

  var fromInput = document.getElementById('from');
  var toInput = document.getElementById('to');
  var dateInput = document.getElementById('departDate');
  var paxInput = document.getElementById('passengers');
  var cabinInput = document.getElementById('cabin');
  var msg = document.getElementById('bookingMsg');

  /* No dates in the past */
  dateInput.min = AL.todayISO();

  /* Come back to a half-finished trip */
  var draft = AL.read(AL.KEYS.draft, null);
  if (draft) {
    fromInput.value = draft.from || '';
    toInput.value = draft.to || '';
    dateInput.value = draft.date || '';
    paxInput.value = draft.passengers || 1;
    cabinInput.value = draft.cabin || 'Economy';
  }

  /* Trip typed on the home page (js/globe.js saves it there) */
  var prefill = AL.read('aviliation_prefill', null);
  if (prefill && !draft) {
    fromInput.value = prefill.from || '';
    toInput.value = prefill.to || '';
    dateInput.value = prefill.date || '';
    paxInput.value = prefill.passengers || 1;
  }
  if (prefill) { AL.remove('aviliation_prefill'); }

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    AL.clearMessage(msg);

    var from = fromInput.value.trim();
    var to = toInput.value.trim();
    var date = dateInput.value;
    var passengers = parseInt(paxInput.value, 10);
    var cabin = cabinInput.value;

    if (!from || !to) {
      AL.showMessage(msg, 'error', 'Enter where you are leaving from and where you are going.');
      return;
    }
    if (AL.codeFromPlace(from) === AL.codeFromPlace(to)) {
      AL.showMessage(msg, 'error', 'The departure and destination are the same. Choose two different places.');
      return;
    }
    if (!date) {
      AL.showMessage(msg, 'error', 'Pick a departure date.');
      return;
    }
    if (date < AL.todayISO()) {
      AL.showMessage(msg, 'error', 'The departure date has passed. Pick today or a later date.');
      return;
    }
    if (!(passengers >= 1 && passengers <= 9)) {
      AL.showMessage(msg, 'error', 'Passengers must be between 1 and 9.');
      return;
    }

    AL.write(AL.KEYS.draft, {
      from: from,
      to: to,
      fromCode: AL.codeFromPlace(from),
      toCode: AL.codeFromPlace(to),
      date: date,
      passengers: passengers,
      cabin: cabin
    });

    AL.showMessage(msg, 'success', 'Trip saved. Opening seat selection...');
    window.location.href = 'seats.html';
  });
})();
