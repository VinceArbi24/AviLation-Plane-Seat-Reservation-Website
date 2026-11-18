# AviLation: HTML, CSS and JavaScript

A plane seat reservation website made of plain HTML, CSS and JavaScript. No build step and no installs.
This is a demo: nothing is sent to a server and no real flights are booked.

## Run it

1. Open this folder in VS Code.
2. Right-click `index.html` and choose **Open with Live Server**.

## What is in this folder

```
AviLation-HTML-CSS-JavaScript/
├── index.html        Home page: hero and flight search
├── login.html        Log in
├── signup.html       Create an account
├── booking.html      Step 2: trip details (from, to, date, passengers, cabin)
├── seats.html        Step 3: pick seats and reserve
├── history.html      Your reservations
├── route.html        Explore destinations
├── style.css         One line that points to css/style.css (login and signup need it here)
├── css/
│   └── style.css     ALL the styling for every page
├── js/
│   ├── common.js     Shared helpers (saving data, messages, dates, header name)
│   ├── booking.js    booking.html: checks the form, saves the trip
│   ├── seats.js      seats.html: draws the seat map, saves the reservation
│   ├── history.js    history.html: lists and cancels reservations
│   └── auth.js       login and signup (see "Not switched on yet" below)
├── images/           Put your pictures here (see images/README.md)
└── README.md
```

The HTML files already point to `css/style.css` and `js/...`, so those two folder names must stay as they are.

## Who edits what

| Part       | Files                      |
|------------|----------------------------|
| HTML       | the seven `.html` files    |
| CSS        | `css/style.css`            |
| JavaScript | everything inside `js/`    |

## How the booking flow works

1. **booking.html** → `booking.js` checks the form and saves the trip, then opens seats.html.
2. **seats.html** → `seats.js` draws the cabin. Pick as many seats as passengers, then press Reserve.
3. **history.html** → `history.js` shows the reservation. Press "Cancel reservation" twice to remove one.

Data is saved in the browser under these localStorage keys:

| Key                   | Holds                          |
|-----------------------|--------------------------------|
| `aviliation_booking`  | the trip being booked          |
| `aviliation_history`  | finished reservations          |
| `aviliation_users`    | accounts made on signup        |
| `aviliation_session`  | who is logged in               |

To start fresh, open the browser dev tools, go to Application → Local Storage, and clear these keys.

## Not switched on yet

`login.html`, `signup.html` and `index.html` have no `<script>` tag, so their forms do nothing yet.
`js/auth.js` is ready. To use it, add this line before `</body>` in **login.html** and **signup.html**:

```html
<script src="js/auth.js"></script>
```

`index.html` also has no `<link>` to the stylesheet. Add this inside its `<head>`:

```html
<link rel="stylesheet" href="css/style.css">
```

Until then the home page shows without styling.

## Colours

| Name           | Hex       | Use                         |
|----------------|-----------|-----------------------------|
| Midnight       | `#1E1F22` | Page background             |
| Charcoal       | `#2B2D31` | Cards and panels            |
| Blurple        | `#5865F2` | Main buttons                |
| Periwinkle     | `#8995FF` | Links and small accents     |
| Off-white      | `#F2F3F5` | Main text                   |
| Muted gray     | `#B5BAC1` | Secondary text              |
| Border         | `#3F4147` | Lines and outlines          |
| Mint           | `#57D9A8` | Success and "done" states   |

All of these are CSS variables at the top of `css/style.css`.

## Put it on GitHub

```bash
cd AviLation-HTML-CSS-JavaScript
git init
git add .
git commit -m "Add AviLation website"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git push -u origin main
```

Working in a group? Make your own branch first so you do not overwrite a teammate:

```bash
git checkout -b css-work
git push -u origin css-work
```
