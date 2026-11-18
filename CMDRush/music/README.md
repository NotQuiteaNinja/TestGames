# CmdRush music library

The library contains **17 SoundHelix tracks**, including the original six and eleven additions: 3, 7–12, and 14–17. See [ATTRIBUTION.md](ATTRIBUTION.md) for the required SoundHelix and artist credits and original download links.

The browser game lists the tracks from `web/src/data/music.json`. The web build stages this directory at `/music/`; tracks are local files and do not need to stream from SoundHelix while playing. The manifest provides titles, artist credit, duration, source URL, and optional estimated BPM.

## Beat response

The browser game analyzes the playing audio. Unknown BPM values are left null rather than inventing a tempo. The six original estimates in `bpm.json` remain for compatibility with the Python game and are marked `bpmEstimated` in the web manifest.

## Adding your own tracks

Place audio files you have permission to use here and add entries to `web/src/data/music.json`, using `/music/<filename>` as the URL. MP3, WAV, and OGG support depends on the browser. Include the correct artist and attribution requirements; do not guess BPM. Restart or rebuild the web version after adding files.

The Python version continues to discover files directly in this folder.
