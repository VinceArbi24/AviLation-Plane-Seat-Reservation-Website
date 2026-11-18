/* ==========================================================================
   AviLation: js/history.js
   history.html: lists saved reservations inside #bookingHistory.
   Works on its own: history.html does not load common.js or jQuery.

   With no bookings the "No Bookings Yet" block from the HTML stays visible.
   ========================================================================== */
(function () {
  'use strict';

  var STORAGE_KEY = 'aviliation_history';
  var container = document.getElementById('bookingHistory');
  if (!container) { return; }

  var emptyBlock = container.querySelector('.empty-history');

  function load() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (err) {
      return [];
    }
  }

  function save(list) {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (err) { /* ignore */ }
  }

  function formatDate(iso) {
    var p = (iso || '').split('-');
    var d = new Date(Number(p[0]), Number(p[1]) - 1, Number(p[2]));
    return isNaN(d.getTime())
      ? (iso || '')
      : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text !== undefined) { node.textContent = text; }
    return node;
  }

  function detail(label, value) {
    var wrap = el('div', 'booking-detail');
    wrap.appendChild(el('span', 'booking-label', label));
    wrap.appendChild(el('span', 'booking-value', value));
    return wrap;
  }

  function buildCard(b) {
    var card = el('article', 'booking-card');

    var head = el('div', 'booking-card-head');
    head.appendChild(el('span', 'booking-ref', b.ref));
    head.appendChild(el('span', 'booking-status', b.status || 'Confirmed'));
    card.appendChild(head);

    var route = el('div', 'booking-route');
    route.appendChild(el('strong', 'booking-code', b.fromCode));
    route.appendChild(el('span', 'booking-line'));
    route.appendChild(el('strong', 'booking-code', b.toCode));
    card.appendChild(route);

    var places = el('p', 'booking-places', b.from + '  to  ' + b.to);
    card.appendChild(places);

    var meta = el('div', 'booking-meta');
    meta.appendChild(detail('Departure', formatDate(b.date)));
    meta.appendChild(detail('Cabin', b.cabin));
    meta.appendChild(detail('Passenger', b.passengerName));
    meta.appendChild(detail('Seats', (b.seats || []).join(', ')));
    card.appendChild(meta);

    var actions = el('div', 'booking-actions');
    var cancel = el('button', 'booking-cancel', 'Cancel reservation');
    cancel.type = 'button';
    cancel.setAttribute('data-ref', b.ref);
    actions.appendChild(cancel);
    card.appendChild(actions);

    return card;
  }

  function render() {
    var list = load().slice().sort(function (a, b) {
      return (b.bookedAt || '').localeCompare(a.bookedAt || '');
    });

    Array.prototype.slice.call(container.querySelectorAll('.booking-card')).forEach(function (n) { n.remove(); });

    if (emptyBlock) { emptyBlock.hidden = list.length > 0; }
    list.forEach(function (b) { container.appendChild(buildCard(b)); });
  }

  /* Two taps to cancel, so a stray click does not delete a booking. */
  container.addEventListener('click', function (event) {
    var btn = event.target.closest('.booking-cancel');
    if (!btn) { return; }

    if (btn.getAttribute('data-confirm') !== 'yes') {
      btn.setAttribute('data-confirm', 'yes');
      btn.textContent = 'Tap again to cancel';
      window.setTimeout(function () {
        btn.removeAttribute('data-confirm');
        btn.textContent = 'Cancel reservation';
      }, 4000);
      return;
    }

    var ref = btn.getAttribute('data-ref');
    save(load().filter(function (b) { return b.ref !== ref; }));
    render();
  });

  render();
})();
