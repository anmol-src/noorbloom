# Noor's Bloom Room — Build Spec

## Overview
A simple, cute, mobile-first web app where Noor's friends can sign up to visit her during recovery, suggest activities, vote on them, and leave notes. Deployed on Vultr VPS under a subdomain (e.g. `bloom.anmol.be`).

## Tech Stack
- **Backend:** Django 5.x, SQLite, Gunicorn
- **Frontend:** Django templates, vanilla HTML/CSS/JS (no React, no build step)
- **Server:** Vultr VPS (Ubuntu 24.04, Amsterdam), Caddy reverse proxy
- **Fonts:** Google Fonts — Baloo 2 (display/titles), Quicksand (body text)
- **No Docker, no Kubernetes, no Celery, no Redis**

## Pages & Flow

### Page 1: Welcome Screen
- Centered card on warm gradient background (soft pink → peach → light lavender)
- **Hot pink heart emoji** (💛 but rendered in #FF1493 hot pink) — large, centered above title
- **Title:** "Noor's Bloom Room" in **Baloo 2** font, gradient text from #FF1493 (hot pink) to #FF6969
- **Subtitle:** "Enter your name, play games, eat food, and make memories."  (muted pink-mauve color #BB7799)
- **Input field:** rounded, light pink background (#FFF8FA), border #FFD6E0, placeholder "Your name..."
- **Button:** "Let's Go! 🎉" — gradient from peachy pink (#FF6B9D) to orange (#FFA751), white bold text, rounded corners (14px radius)
- **Animations:**
  - Floating flower petals (✿ and ❀) drifting upward continuously in various pink/peach tones, looping
  - Subtle shimmer sparkle dots around the heart
  - Card fades in + slides up on page load
- **Name storage:** localStorage on the browser. Name is associated with all actions on that device.
- **Background:** linear gradient — #FFF5F7 → #FFF0E5 → #F8F0FF

### Page 2: Main Page (after entering name)
Single scrollable page with these sections stacked vertically:

#### Header (sticky top)
- "Noor's Bloom Room" in Baloo 2, hot pink (#FF1493)
- Below: "Hi, **Sara**" (pink) + "· change name" link (gray, tappable — clears localStorage, returns to welcome)

#### Section: Schedule
- Section title: "Schedule" in bold dark pink (#CC1177) with a thin pink line extending to the right

##### Vertical Day Cards (Sun Mar 15 – Sat Mar 21)
Each day is a white rounded card (16px radius) with light pink border (#FFD6E0), containing:

- **Day-date label:** rectangular with rounded corners (6px radius)
  - **Selected/current day:** feminine purple fill (#C850C0), white bold text
  - **Other days:** white background, **light pink border** (#FFB6C8), dark pink text (#D4467A)
- **Friend name capsules:** pill-shaped (full rounded), **glowy orange gradient** (#FF9A3E → #FFB347), **bold white text**
  - A small × button appears ONLY on your own capsule (for deletion)
- **Activity tags:** **rectangular** (4px radius), each with a distinct color:
  - Entertainment: pink bg #FFEEF4, border #E8307B, text #C4266A
  - Games: purple bg #EAE0FF, border #7C4DFF, text #5A2DB5
  - Movies: green bg #E8F5E9, border #43A047, text #2E7D32
  - Food: red bg #FDE7E7, border #E53935, text #B71C1C
  - Snacks: teal bg #E0F2F1, border #26A69A, text #1A7A6E
  - Tea: golden bg #FFF8E1, border #F9A825, text #C17B00
- **"+ Add my visit"** button: dashed pink border (#FF1493), pink text, rectangular (4px radius)

##### "Add my visit" flow (expands inline or modal):
- Free text field: "When are you coming?" — placeholder: "e.g. afternoon, around 3..."
- Optional field: "Bringing anything?" — placeholder: "e.g. snacks, games..."
- Pre-made tag selector: Entertainment, Games, Movies, Food, Snacks, Tea (tap to toggle)
- Submit button

##### Empty days:
- Show day-date label + "Add my visit" button only (no empty slot placeholders)

#### Section: Activities
- NOT a separate section. Activity tags are shown per-day inside each day card.
- Friends can add activities when they add their visit.
- Voting on activities: tap a tag to upvote. Show vote count on hover/tap.

#### NO Notes Section
- Removed from scope.

## Data Models (Django)

```python
class Visit(models.Model):
    day = models.CharField(max_length=10)  # e.g. "sun-15"
    name = models.CharField(max_length=100)
    time_text = models.CharField(max_length=200)  # free text: "afternoon", "around 3"
    bringing = models.CharField(max_length=200, blank=True)
    tags = models.JSONField(default=list)  # ["games", "snacks"]
    created_at = models.DateTimeField(auto_now_add=True)

class TagVote(models.Model):
    day = models.CharField(max_length=10)
    tag = models.CharField(max_length=50)
    voter_name = models.CharField(max_length=100)
    class Meta:
        unique_together = ('day', 'tag', 'voter_name')
```

## API Endpoints (Django views, return JSON)

- `GET /api/visits/` — all visits
- `POST /api/visits/` — add a visit (name, day, time_text, bringing, tags)
- `DELETE /api/visits/<id>/` — delete a visit (only if name matches localStorage name)
- `POST /api/votes/` — toggle vote on a tag for a day
- `GET /api/votes/` — all votes

## Security
- CSRF protection on all POST/DELETE (Django default)
- Rate limiting: django-ratelimit on POST endpoints (e.g. 30/hour per IP)
- Input sanitization: escape all user input before rendering (Django template auto-escaping)
- No authentication (by design — small friend group)
- HTTPS enforced via Caddy auto-TLS
- `ALLOWED_HOSTS` set to the subdomain only
- `DEBUG = False` in production
- `SECRET_KEY` from environment variable
- `SECURE_BROWSER_XSS_FILTER = True`
- `SECURE_CONTENT_TYPE_NOSNIFF = True`
- `X_FRAME_OPTIONS = 'DENY'`
- `SECURE_HSTS_SECONDS = 31536000`
- CSP header via middleware (restrict to self + Google Fonts CDN)

## Deployment
- Subdomain: TBD (e.g. `bloom.anmol.be`)
- Caddy reverse proxy → Gunicorn (port 8XXX)
- systemd service for Gunicorn
- SQLite database in project directory
- Static files served by Caddy (or whitenoise)
- `git pull` + `systemctl restart` for updates

## Git
- Push to GitHub repo (new repo or subdirectory of existing)
- `.gitignore`: db.sqlite3, __pycache__, .env, *.pyc
- `.env` file for SECRET_KEY (not committed)

## Design Tokens Summary
| Element | Style |
|---------|-------|
| Background (welcome) | Gradient #FFF5F7 → #FFF0E5 → #F8F0FF |
| Background (main) | #FFF5F7 |
| Title font | Baloo 2, 800 weight |
| Body font | Quicksand, 400/600/700 |
| Title gradient | #FF1493 → #FF6969 |
| Button gradient | #FF6B9D → #FFA751 |
| Friend name pills | Gradient #FF9A3E → #FFB347, bold white text, full rounded |
| Day label (selected) | #C850C0 fill, white text |
| Day label (unselected) | White fill, #FFB6C8 border, #D4467A text |
| Card borders | #FFD6E0 (light pink) |
| Section title | #CC1177 |
| Activity tags | Rectangular (4px radius), distinct colors per type (see above) |
| Add visit button | Dashed #FF1493 border, #FF1493 text |
| Floating petals | ✿ ❀ in various pinks, peach, coral — CSS keyframe float-up |
| Heart | 💛 emoji at ~52px, tinted hot pink |

## Mobile-First
- All touch targets minimum 44px
- Font sizes: minimum 13px body, 10px labels
- Cards have generous padding (16px+)
- Horizontal scrolling: none
- Tested on: iPhone Safari, Android Chrome
