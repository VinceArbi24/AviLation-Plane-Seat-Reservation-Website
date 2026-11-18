/* ==========================================================================
   AviLation: js/common.js
   Shared helpers used by booking.html and seats.html.
   Loaded as a plain script, so everything hangs off window.AviLation.

   All data is saved in the browser (localStorage). This is a demo, so
   nothing is sent to a server and no real flights are booked.
   ========================================================================== */
(function () {
  'use strict';

  var KEYS = {
    users: 'aviliation_users',      // [{ fullname, email, username, password }]
    session: 'aviliation_session',  // { fullname, username }
    draft: 'aviliation_booking',    // trip being booked right now
    history: 'aviliation_history'   // [{ ref, from, to, date, seats, ... }]
  };

  function read(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) {
      return fallback;
    }
  }

  function write(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      return false;
    }
  }

  function remove(key) {
    try { window.localStorage.removeItem(key); } catch (err) { /* ignore */ }
  }

  function getSession() {
    return read(KEYS.session, null);
  }

  /* Show a message in one of the .msg boxes. type: 'error' or 'success'. */
  function showMessage(el, type, text) {
    if (!el) { return; }
    el.className = 'msg ' + type;
    el.textContent = text;
  }

  function clearMessage(el) {
    if (!el) { return; }
    el.className = 'msg';
    el.textContent = '';
  }

  /* "Manila, Philippines (MNL)" -> "MNL" */
  function codeFromPlace(text) {
    var match = /\(([A-Za-z]{3})\)\s*$/.exec(text || '');
    return match ? match[1].toUpperCase() : (text || '').trim().slice(0, 3).toUpperCase();
  }

  /* "Manila, Philippines (MNL)" -> "Manila, Philippines" */
  function nameFromPlace(text) {
    return (text || '').replace(/\s*\([A-Za-z]{3}\)\s*$/, '').trim();
  }

  /* "2026-12-12" -> "12 Dec 2026" */
  function formatDate(iso) {
    if (!iso) { return ''; }
    var parts = iso.split('-');
    var d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    if (isNaN(d.getTime())) { return iso; }
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function todayISO() {
    var d = new Date();
    var m = String(d.getMonth() + 1).padStart(2, '0');
    var day = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + m + '-' + day;
  }

  /* Fills the "Guest" chip in the header with the signed-in name. */
  function refreshUserChip() {
    var chip = document.getElementById('userChip');
    var session = getSession();
    if (chip) {
      chip.textContent = session && session.fullname ? session.fullname : 'Guest';
    }
  }

  document.addEventListener('DOMContentLoaded', refreshUserChip);

  window.AviLation = {
    KEYS: KEYS,
    read: read,
    write: write,
    remove: remove,
    getSession: getSession,
    showMessage: showMessage,
    clearMessage: clearMessage,
    codeFromPlace: codeFromPlace,
    nameFromPlace: nameFromPlace,
    formatDate: formatDate,
    todayISO: todayISO,
    refreshUserChip: refreshUserChip
  };
})();
