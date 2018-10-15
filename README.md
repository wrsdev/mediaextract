# mediaextract - Extract part of a media file

Command line tool for slicing media files and extracting audio.

Requires [FFmpeg](https://ffmpeg.org/) installed on your system and available in your executable *PATH* or use `--ffmpeg-path` to point to it directly

```
mediaextract <in-file> [start-time] [end-time]

Extract part of a media file

Positionals:
  in-file     Path to input file
  start-time  Start position
  end-time    End position

Options:
  --version            Show version number                             [boolean]
  --copy, -c           Copy streams instead of re-encoding. Faster and better
                       quality, but less accurate seeking              [boolean]
  --duration, -d       Optional duration instead of end time
  --extract-audio, -x  Extract audio stream only                       [boolean]
  --format, -f         Output file format                               [string]
  --ffmpeg-path        Path to ffmpeg binary if not found in environment[string]
  --quiet, -q          No console output except for errors             [boolean]
  --verbose            Show more information                           [boolean]
  --help               Show help                                       [boolean]
```