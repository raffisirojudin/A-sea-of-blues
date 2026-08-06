# ◑ A sea of blues

*Same sea — every hour a different blue.*

An ambient, ever-changing scene rendered entirely in HTML5 Canvas and vanilla JavaScript. Drag one slider and watch an entire world drift from dawn to moonlight — across four living places, each with its own weather, wildlife, and secrets.

---

## ✦ Places

| | |
|---|---|
| **◑ Ocean** | Layered waves with a glittering sun-path, a palm-lined beach, fish that leap out of the water, and ripples wherever you click the surface. |
| **▲ Mountain** | Snow-capped ridges with real visual hierarchy, pine forest, fireflies, and — if you're patient, in the right season, at the right hour — the aurora. |
| **☼ Desert** | Rolling dunes, saguaro cacti, heat-shimmer at midday, and the most star-dense sky of the four. |
| **❋ Forest** | Dense tropical canopy in clustered layers, thick drifting mist, and kunang-kunang (fireflies) in numbers the other places don't get. |

## ✦ Time, seasons & weather

- A single slider drives a full day/night cycle — dawn, morning, midday, golden hour, sunset, moonlit — and everything in the scene (sky, water, rock, sand, foliage, stars) responds to it.
- **▶ Auto-play** glides through the whole day on its own.
- **Seasons** (spring/summer/autumn/winter) shift the mountain's slope color and snow line — only shown there, since that's where the difference actually reads.
- **☂ Rain** falls with scene-appropriate splashes (ripples on water, dust on ground), occasional lightning and thunder, and a sky that overcasts to match.

## ✦ Living detail

- Procedural constellations, shooting stars, and — very occasionally — something that isn't a shooting star at all.
- Ambient audio synthesized live with the Web Audio API: waves, wind, rain, birds, crickets. No audio files.
- Film grain, atmospheric haze, and depth-based parallax throughout.
- A self-calibrating performance mode: the scene measures its own frame time on load and quietly lightens the load if the device needs it — no settings menu required.

## ✦ Secrets

There's more hidden in this scene than what's listed above. Some of it rewards curiosity, some of it rewards very specific, very old habits. Have a look around. 🥚

## Controls

| Control | Effect |
|---|---|
| Drag the slider | Move through the day |
| **▶** | Auto-play the day |
| **♪** | Toggle ambient sound |
| **☂** | Toggle rain |
| `OCEAN` / `MOUNTAIN` / `DESERT` / `FOREST` | Change place |
| `SPR` / `SUM` / `AUT` / `WIN` *(mountain only)* | Change season |

## Tech

- **HTML5 Canvas 2D** — no rendering or animation libraries
- **Vanilla JavaScript** (ES6+) — no framework, no build step, no dependencies
- **Web Audio API** for real-time procedural sound synthesis
- **CSS3** for the overlay UI (glassmorphism controls, responsive layout)

Everything runs client-side. There's no backend, no bundler, and nothing to `npm install`.

## Running locally

```bash
git clone https://github.com/<your-username>/<your-repo>.git
cd <your-repo>
```

Then just open `index.html` in a browser — or serve it locally if you'd rather:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Deploying

This is a static site — three files (`index.html`, `style.css`, `script.js`) plus `preview.jpg`. GitHub Pages works out of the box: **Settings → Pages → Deploy from branch → main**.

## License

*(add a license of your choice — MIT is a common pick for a project like this)*

---

<sub>Built one conversation at a time. If you find something in here you weren't supposed to, that's the point.</sub>
