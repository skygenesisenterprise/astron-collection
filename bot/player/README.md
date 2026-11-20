# Player

Player owns voice playback for the Astron Collection. It resolves a URL or a
search query with yt-dlp, streams audio through `@discordjs/voice`, and keeps
per-guild queues in memory plus history and playlists in SQLite.

## Commands

| Command | Purpose |
| --- | --- |
| `/play <query>` | Play a URL or search result; queue when something is playing |
| `/pause`, `/resume` | Pause and resume |
| `/skip` | Next track |
| `/stop` | Clear the queue and stop |
| `/queue` | Upcoming tracks, loop and volume |
| `/nowplaying` | Current track |
| `/volume <0-150>` | Volume |
| `/loop <off\|track\|queue>` | Loop mode |
| `/shuffle` | Shuffle upcoming tracks |
| `/remove <position>` | Remove an upcoming track |
| `/seek <seconds>` | Restart the current track at an offset |
| `/history` | Recently played |
| `/disconnect` | Stop and leave voice |
| `/playlist create\|add\|list\|show\|play\|delete` | Persisted playlists |
| `/sources` | Supported sources and resolver |

## Audio

yt-dlp resolves metadata and produces the audio stream; ffmpeg (provided by the
image) decodes it. YouTube, SoundCloud and direct audio URLs are supported.
Spotify/Apple Music links are not streamed directly, by design. Voice modules
are loaded lazily, so the bot, its tests and its health endpoint start even when
voice dependencies are unavailable.

## Events

`track.started` is written to the transactional outbox and delivered with
HMAC-SHA256 signatures when `ASTRON_EVENT_URL` and `ASTRON_EVENT_SECRET` are set.

## Data

One SQLite database owned by Player: `track_history`, `playlists`,
`playlist_tracks`, `bot_settings`, `event_outbox`. Queues are ephemeral, as
voice sessions are; history and playlists survive restarts.

## Run

```sh
pnpm install
cp bot/player/.env.example bot/player/.env
pnpm --filter @astron-collection/player deploy:commands
pnpm --filter @astron-collection/player start
```

Docker: `docker compose -f bot/player/docker-compose.yml up -d`.
Health and metrics: `/healthz`, `/livez`, `/metrics` (port 3015).

## Tests

```sh
node --disable-warning=ExperimentalWarning --test bot/player/tests/
```
