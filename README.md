# mediaextract - Extract parts of media files

```
mediaextract <in-file> [start-time] [end-time]

Extract part of a media file

Positionals:
  in-file     Path to input file
  start-time  Start position
  end-time    End position

Options:
  --version            Show version number                             [boolean]
  --convert, -c        Re-encode streams instead of copying
  --duration, -d       Optional duration instead of end time
  --extract-audio, -x  Extract audio stream only                       [boolean]
  --quiet, -q          No console output except for errors             [boolean]
  --verbose            Show more information                           [boolean]
  --help               Show help                                       [boolean]
```