# 🎅 Family Secret Santa App

A web app for running your family's annual Secret Santa draw.
- Every individual participates (not just one per family)
- Nobody is matched with someone from their own family
- Assignment emails sent automatically on draw day
- Reminder emails at 6 weeks, 2 weeks, and 3 days before the meetup
- People without smartphones get a printable slip instead

---

## Setup (one-time, takes ~10 minutes)

### 1. Set up Gmail for sending emails

The app sends emails using a Gmail account. You need a **Gmail App Password** — this is different from your regular Gmail password.

1. Go to your Google Account: https://myaccount.google.com
2. Turn on **2-Step Verification** if it's not already on
3. Go to **Security → App passwords** (search "App passwords" in the Google Account search bar)
4. Create a new app password — name it "Secret Santa"
5. Copy the 16-character password it gives you

### 2. Configure the backend

```
cd secret-santa/backend
copy .env.example .env
```

Open `.env` and fill in:

```
GMAIL_USER=yourgmail@gmail.com
GMAIL_APP_PASSWORD=xxxx xxxx xxxx xxxx   ← the 16-char app password from step 1
ADMIN_PASSWORD=your-chosen-password       ← whatever you want as the login password
```

### 3. Start the backend

```
cd secret-santa/backend
npm start
```

You should see: `Secret Santa backend running on http://localhost:3001`

### 4. Start the frontend (in a new terminal)

```
cd secret-santa/frontend
npm run dev
```

You should see: `Local: http://localhost:5173`

### 5. Open the app

Go to **http://localhost:5173** in your browser and log in with your admin password.

---

## How to run the draw

1. **Settings** — set your meetup date first (so reminders are scheduled)
2. **Families** — add each family unit (e.g. "The Johnsons", "Grandma", etc.)
3. **Members** — add every individual, assign them to their family, add their email
   - For people without smartphones (like Shosh), tick "No smartphone" — they'll get a printed slip
4. **Settings → Test Email** — send yourself a test email to verify Gmail is working
5. **Run Draw** — click the big button! Assignments are made and emails go out instantly
6. **Assignments** — view all pairs. For anyone marked "Print slip", click the 🖨 button, then print the page

---

## Reminders

Once the draw is done and a meetup date is set, the backend automatically sends reminder emails at:
- **6 weeks before** — "Start thinking early!"
- **2 weeks before** — "Have you sorted your gift?"
- **3 days before** — Final nudge

The backend must be running for reminders to send. If you're hosting it on a server (e.g. a VPS or Railway), it will run continuously. If you're running it on your laptop, make sure it's on around those dates.

---

## Folder structure

```
secret-santa/
  backend/
    src/
      algorithm.js   ← the draw logic (constrained shuffle)
      store.js       ← data persistence (saves to data.json)
      mailer.js      ← email sending + HTML templates
      scheduler.js   ← automatic reminder scheduler
      routes.js      ← all API endpoints
    index.js         ← server entry point
    data.json        ← created automatically when you first save data
    .env             ← your secrets (never share this file)
  frontend/
    src/
      pages/         ← Login, Dashboard, Families, Members, Draw, Assignments, Settings, PrintSlip
      components/    ← Layout + sidebar
      api.js         ← API client
```

---

## Resetting the draw

If you need to redo the draw (e.g. you made a mistake entering people):
1. Go to **Run Draw** and click **Reset Draw**
2. Fix whatever needs fixing in Families / Members
3. Run the draw again

Resetting clears all assignments and reminder history. It does NOT unsend emails already sent.
