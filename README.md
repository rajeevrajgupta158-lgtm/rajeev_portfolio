# 🌫️ Cinematic Scrollytelling Portfolio | Rajeevraj Gupta
> Inspired by **Design With Alok (@designwithalok)** — *"Inspiration ko bas save mat karo, use build karo."*

This project implements an **Apple-style Canvas Image Sequence Scrollytelling Engine** customized for **Rajeevraj Gupta** (Full-Stack Developer, Navi Mumbai). 

As the visitor scrolls down the page, **240 high-performance WebP frames** of a 4K waterfall video render synchronously on an HTML5 `<canvas>`, with typography and portfolio sections fading in as chapters over the motion.

---

## 🚀 Key Improvements & Features

1. **Extended Video & Scroll Runway (650vh)**:
   - Upgraded to **240 WebP frames** (10 full seconds of high-frame-rate waterfall motion).
   - Scroll track extended to **650vh** so the animation feels deeper, leisurely, and buttery smooth without speeding past!

2. **iPhone / iOS Frosted Liquid Glass Aesthetics**:
   - Ultra-premium **`backdrop-filter: blur(28px) saturate(190%)`** frosted glass panels with specular 1px rim lighting (`box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.25)`).
   - **Zero Camouflage**: Dark-tinted translucent backing containers (`rgba(11, 15, 22, 0.75)`) and enhanced vignette underlays ensure that white text and headings remain 100% crisp and legible on every single frame!

3. **Direct-to-Inbox Mail Dispatch (Chapter 4)**:
   - Interactive glass form where visitors can directly enter their Name, Email, and Message.
   - Dispatches straight to `Rajeevrajgupta158@gmail.com` via AJAX with real-time feedback (`✓ Delivered directly to Rajeevraj's inbox!`).
   - Seamless fallback: Automatically opens the email client pre-filled if offline or on restricted networks.

4. **FrameStore: Progressive Preloading ("Every 8th Frame First")**:
   - Loads keyframes (`0, 8, 16, 24...`) first so the page is immediately interactive without waiting for all frames to download.
   - Remaining intermediate frames are seamlessly fetched in the background.

5. **High-DPI Retina Support & Aspect Ratio Cover**:
   - Dynamically scales with `devicePixelRatio` and centers the video frame to cover 100% of any viewport (desktop, tablet, mobile).

6. **Telemetry HUD (Heads-Up Display)**:
   - Real-time frame counter (`FRAME 001 / 240`), scroll progress (`SCROLL 0% - 100%`), and active chapter indicator.

---

## 📁 Featured Projects on Display

1. 🎮 **Shark Paradise** (3D Web Game)
   - *Description:* Full 3D underwater stealth-action game built from scratch without external libraries. Features procedural seabed generation, real-time Sonar Radar, Great White AI stalking mechanics, FPP/TPP perspective switching, and mobile touch support.
   - *Tech Stack:* WebGL / Canvas, Vanilla JS (ES6+), Procedural 3D, Audio & AI
   - *Live Link:* https://cheery-scone-96e42e.netlify.app/

2. 🛒 **Mall Mapper** (Final Year Project)
   - *Description:* Mall-centric e-commerce web app that digitizes the in-store shopping experience with searchable digital directory, category-vendor mapping, animated 3D visuals, and live cart flow.
   - *Tech Stack:* Vanilla JS, HTML5/CSS3, 3D Visuals
   - *Live Link:* https://mall-mapper.vercel.app/

3. 📦 **Inventory Management System** (Minor Project)
   - *Description:* Data-driven inventory SaaS providing real-time stock visibility across products, automated analytics to track stock trends, and role-based sales reporting.
   - *Tech Stack:* Node.js, Express, MongoDB, REST API
   - *Live Link:* https://inventory-saas-backend.vercel.app/

4. 🎬 **Cinematic Canvas Scroller Engine** (Creative Web)
   - *Description:* Apple-style 120 FPS frame-preloaded video scrub engine with chapter transitions and responsive canvas rendering.
   - *Tech Stack:* HTML5 Canvas, WebP Sequencing, 60–120 FPS

---

## 🌐 Running the Website Locally

Run a lightweight local web server inside this directory:

**Option A (Python - Mobile & Desktop):**
```bash
python -m http.server 5173 --bind 0.0.0.0
```
- **Desktop:** Open `http://localhost:5173`
- **Mobile Phone (Same Wi-Fi):** Open `http://10.215.151.1:5173` (or your local IP)
- **Mobile Emulator in Chrome/Edge:** Press `F12` → `Ctrl + Shift + M` → Pick `iPhone 14 Pro` / `Samsung Galaxy`.

**Option B (Node.js):**
```bash
npx serve .
```

---

## 📁 Project Structure

```text
cinematic-portfolio/
├── index.html           # Main HTML structure with chapters & telemetry HUD
├── styles.css           # iPhone frosted glass theme, typography, mist
├── app.js               # Canvas FrameStore engine, scroll controller, direct mail API
├── convert-video.bat    # 1-Click Windows batch script to convert any MP4 to WebP frames
├── convert-video.ps1    # PowerShell script alternative
├── frames/              # 240 WebP frames (frame_0001.webp ... frame_0240.webp)
└── README.md            # Complete documentation
```
