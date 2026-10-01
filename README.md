# YouTube Clone (MERN Stack)

A full-stack YouTube clone built with **MongoDB, Express, React and Node.js**. Users can browse a video feed, search by title, filter by category, sign up / sign in with JWT authentication, watch videos, like/dislike them, manage comments, create their own channel and upload, edit or delete their videos.


---

## https://github.com/dapoojary9/youtube-clone-mern

---

## Features

### Home page
- YouTube-style **header**: hamburger menu, logo, search bar, Create button, notifications, account menu.
- **Sidebar** toggled from the hamburger menu:
  - Wide screens (≥1312px): docked sidebar that collapses to a 72px mini rail.
  - Tablets (792–1311px): mini rail + slide-in drawer.
  - Phones (<792px) and the watch page: slide-in drawer with backdrop.
- **10 category filter chips** (All, Coding, Education, Music, Gaming, Movies, Travel, Science, Comedy, Sports, News) with scroll arrows. Sidebar "Explore" links use the same filters.
- **Responsive video grid** – each card shows thumbnail, title, channel name, avatar, views and upload age.
- Loading skeletons, empty and error states.

### Authentication (JWT)
- Register with **username, email, password** (+ confirm password).
- Client-side **and** server-side validation, with the error shown under each field:
  - Username: 3–20 characters, letters/numbers/underscore, unique.
  - Email: valid format, unique.
  - Password: at least 8 characters with at least one letter and one number.
- After a successful registration the user is **automatically redirected to the login page** (email prefilled).
- Before sign-in the header shows a **Sign in** button that opens a separate `/login` URL with a **Google-style sign-in form** (with a link to create an account).
- After sign-in the user's **avatar and username appear in the header** and they return to the home page.
- The token is stored in `localStorage`, sent via an Axios interceptor as `Authorization: Bearer <token>` and verified by the `protect` middleware. Expired tokens sign the user out automatically.
- Passwords are hashed with **bcrypt** and never returned by the API.

### Search & filter
- The header search bar filters videos by **title** (case-insensitive, handled by MongoDB `$regex` on the server).
- Category chips filter by **category**; search and category can be combined (`/?search=react&category=Coding`).
- Newly uploaded videos appear on the home page right away and under their category chip.

### Video player page (`/watch/:id`)
- Plays **YouTube links** through the official embed player and **direct .mp4/.webm files** through the HTML5 `<video>` player.
- Title, views, upload date, category tag and an expandable description.
- Channel info with **Subscribe / Subscribed** toggle.
- **Like / Dislike** that toggle and exclude each other (one reaction per user, stored in MongoDB, highlighted on reload).
- **Comments with full CRUD** – add, edit (inline), delete (with confirmation). Each comment is saved in the `comments` collection and linked to the video.
- Related videos sidebar (same category first).
- Share (copies the link) button.

### Channel page (`/channel/:id`)
- **Create a channel** (`/channel/new`) – only available once signed in (protected route). One channel per account.
- Banner, avatar, name, @handle, subscriber and video counts, description.
- **Videos tab** listing every video of the channel, sortable by Latest / Popular / Oldest, and an **About tab**.
- For the channel owner: **Upload video**, **Edit video** and **Delete video** (CRUD) plus **Customize channel** (edit channel details).
- Upload form validates all fields and shows a live thumbnail preview. For YouTube links the thumbnail is filled in automatically.

### Extras
- Light / dark theme toggle (saved in `localStorage`).
- Toast notifications for every action.
- View counter incremented on each watch.
- Central error-handling middleware with consistent JSON errors.

---

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router 6, Axios, React Icons, Vite |
| Backend | Node.js, Express 4 |
| Database | MongoDB with Mongoose 8 (local or MongoDB Atlas) |
| Auth | JSON Web Tokens (`jsonwebtoken`), `bcryptjs` |
| Styling | Plain CSS with CSS variables (no UI framework) |
| Version control | Git |

---

## Getting started

### Prerequisites
- Node.js 18+ and npm
- MongoDB running locally **or** a MongoDB Atlas connection string

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/youtube-clone-mern.git
cd youtube-clone-mern
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env      # then edit the values
npm run seed              # loads sample users, channels, videos and comments
npm run dev               # starts the API on http://localhost:5000 (nodemon)
```

`.env` values:

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | API port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/youtube_clone` or your Atlas URI |
| `JWT_SECRET` | Secret for signing tokens | any long random string |
| `JWT_EXPIRES_IN` | Token lifetime | `7d` |
| `CLIENT_URL` | Allowed frontend origin(s) for CORS | `http://localhost:5173` |

> No MongoDB installed? Run `npm run dev:memory` instead. It starts an in-memory MongoDB, seeds it and launches the API (data resets on restart).

### 3. Frontend

```bash
cd ../frontend
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm run dev               # opens http://localhost:5173
```

Production build: `npm run build` (output in `frontend/dist`).

---

## Sample accounts

All seeded accounts use the password **`Password123`**.

| Username | Email | Channel |
|----------|-------|---------|
| JohnDoe | john@example.com | Code with John (coding & education) |
| JaneSmith | jane@example.com | Pixel Play Studio (gaming & movies) |
| AlexRivera | alex@example.com | Wander & Wonder (travel, science, music, comedy) |

The seed creates 24 videos in 9 categories (including the sample *"Learn React in 30 Minutes"* video with its comment "Great video! Very helpful.") and 6 comments.

---

## API reference

Base URL: `http://localhost:5000/api`. Endpoints marked **(auth)** require `Authorization: Bearer <token>`.

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create an account `{ username, email, password }` |
| POST | `/auth/login` | Log in `{ email, password }` → `{ token, user }` |
| GET | `/auth/me` (auth) | Current user profile (with channels) |

### Channels
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/channels` (auth) | Create a channel `{ channelName, description, channelBanner, channelAvatar }` |
| GET | `/channels/:id` | Channel info (+ `isSubscribed` when signed in) |
| GET | `/channels/:id/videos` | All videos of a channel |
| PUT | `/channels/:id` (auth) | Update channel (owner only) |
| DELETE | `/channels/:id` (auth) | Delete channel, its videos and comments (owner only) |
| PUT | `/channels/:id/subscribe` (auth) | Toggle subscription |

### Videos
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/videos?search=&category=&exclude=&limit=` | List / search by title / filter by category |
| GET | `/videos/categories` | Available categories |
| GET | `/videos/:id` | Single video (+ viewer's `userReaction`) |
| POST | `/videos` (auth) | Upload video metadata `{ title, description, videoUrl, thumbnailUrl, category }` |
| PUT | `/videos/:id` (auth) | Update video (uploader only) |
| DELETE | `/videos/:id` (auth) | Delete video and its comments (uploader only) |
| PATCH | `/videos/:id/view` | Increment view count |
| PUT | `/videos/:id/like` (auth) | Toggle like (removes dislike) |
| PUT | `/videos/:id/dislike` (auth) | Toggle dislike (removes like) |

### Comments
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/videos/:videoId/comments` | Comments of a video (newest first) |
| POST | `/videos/:videoId/comments` (auth) | Add a comment `{ text }` |
| PUT | `/comments/:id` (auth) | Edit a comment (author only) |
| DELETE | `/comments/:id` (auth) | Delete a comment (author only) |

**Error format:** `{ "success": false, "message": "Validation failed", "errors": { "email": "Enter a valid email address" } }`. Status codes: 400 validation, 401 not signed in / bad token, 403 not the owner, 404 not found, 409 duplicate.

---

## Data models

```text
User     { username*, email*, password (bcrypt hash, hidden), avatar, channels[→Channel] }
Channel  { channelName*, handle*, owner→User, description, channelBanner, channelAvatar,
           subscribers, subscribedBy[→User], videos[→Video] }
Video    { title*, description, videoUrl*, thumbnailUrl*, category*, channel→Channel,
           uploader→User, views, likedBy[→User], dislikedBy[→User], uploadDate }
           virtuals: likes, dislikes
Comment  { video→Video, user→User, text*, edited, createdAt }
```

- Video and thumbnail **URLs are stored as file metadata** in the `videos` collection (`videoUrl`, `thumbnailUrl`).
- Likes/dislikes are stored as arrays of user ids so each user can react once and the UI can show their current reaction.
- Comments live in their own collection and reference the video, so they can be edited or deleted on their own.

---

## Usage walkthrough

1. Open the home page, try the category chips and search for "react".
2. Click **Sign in** → **Create account**. Submit the empty form to see validation messages, then register. You are redirected to the login page.
3. Sign in. Your username now appears in the header.
4. Click **Create** (or *Create channel* in the sidebar) and create your channel.
5. On your channel click **Upload video**. Paste a YouTube link (thumbnail fills in automatically) or an mp4 URL such as `https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4` with a thumbnail URL, pick a category and upload.
6. Go back home and click that category chip. Your video is there.
7. Open the video: like / dislike it, add a comment, edit it from the ⋮ menu, then delete it.
8. Back on your channel, edit or delete the video with the pencil / trash icons.

---

## Responsive design

| Width | Layout |
|-------|--------|
| ≥ 1312px | Docked sidebar (full ↔ mini), multi-column grid, player + related list side by side |
| 1100–1311px | Mini rail + drawer, related videos next to the player |
| 792–1099px | Mini rail + drawer, related videos below the player |
| 640–791px | Drawer only, compact header icons |
| < 640px | Single-column feed with edge-to-edge thumbnails, search opens full-width from the search icon, stacked watch page, 2-column channel grid |

---# youtube-clone-mern
