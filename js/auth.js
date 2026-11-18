/* ==========================================================================
   AviLation: js/auth.js
   Sign up and log in (login.html and signup.html).

   NOT LINKED YET: login.html and signup.html have no <script> tag, and the
   HTML must stay as it is. To switch this on, add this line before </body>
   in BOTH files:

       <script src="js/auth.js"></script>

   Demo only. Accounts live in this browser's localStorage and the password
   is stored as typed. Never reuse a real password here.
   ========================================================================== */
(function () {
  'use strict';

  var USERS_KEY = 'aviliation_users';
  var SESSION_KEY = 'aviliation_session';

  function read(key, fallback) {
    try {
      var raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch (err) { return fallback; }
  }
  function write(key, value) {
    try { window.localStorage.setItem(key, JSON.stringify(value)); return true; } catch (err) { return false; }
  }

  /* These two pages have no message box, so add one under the form. */
  function messageBox(form) {
    var box = form.parentNode.querySelector('.msg');
    if (!box) {
      box = document.createElement('div');
      box.className = 'msg';
      box.setAttribute('role', 'alert');
      form.insertAdjacentElement('afterend', box);
    }
    return box;
  }
  function say(box, type, text) { box.className = 'msg ' + type; box.textContent = text; }

  /* ---------- sign up ---------- */
  var signup = document.getElementById('signupForm');
  if (signup) {
    var signupMsg = messageBox(signup);

    signup.addEventListener('submit', function (event) {
      event.preventDefault();
      var fullname = document.getElementById('fullname').value.trim();
      var email = document.getElementById('email').value.trim();
      var username = document.getElementById('username').value.trim();
      var password = document.getElementById('password').value;
      var confirm = document.getElementById('confirmPassword').value;

      if (!fullname || !email || !username || !password) {
        say(signupMsg, 'error', 'Fill in every field.'); return;
      }
      if (password.length < 6) {
        say(signupMsg, 'error', 'Use a password with at least 6 characters.'); return;
      }
      if (password !== confirm) {
        say(signupMsg, 'error', 'The two passwords do not match.'); return;
      }

      var users = read(USERS_KEY, []);
      var taken = users.some(function (u) { return u.username.toLowerCase() === username.toLowerCase(); });
      if (taken) {
        say(signupMsg, 'error', 'That username is taken. Try another one.'); return;
      }

      users.push({ fullname: fullname, email: email, username: username, password: password });
      if (!write(USERS_KEY, users)) {
        say(signupMsg, 'error', 'Your browser would not save the account. Check that storage is not blocked.'); return;
      }
      say(signupMsg, 'success', 'Account created. Taking you to log in...');
      window.setTimeout(function () { window.location.href = 'login.html'; }, 1000);
    });
  }

  /* ---------- log in ---------- */
  var login = document.getElementById('loginForm');
  if (login) {
    var loginMsg = messageBox(login);

    login.addEventListener('submit', function (event) {
      event.preventDefault();
      var username = document.getElementById('username').value.trim();
      var password = document.getElementById('password').value;

      var match = read(USERS_KEY, []).filter(function (u) {
        return u.username.toLowerCase() === username.toLowerCase() && u.password === password;
      })[0];

      if (!match) {
        say(loginMsg, 'error', 'Wrong username or password. If you are new, sign up first.'); return;
      }
      write(SESSION_KEY, { fullname: match.fullname, username: match.username });
      say(loginMsg, 'success', 'Welcome back, ' + match.fullname + '. Opening booking...');
      window.setTimeout(function () { window.location.href = 'booking.html'; }, 800);
    });
  }
})();
