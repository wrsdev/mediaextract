const path = require('path');
const yargs = require('yargs');
const ffmpeg = require('fluent-ffmpeg');
const moment = require('moment');
require('moment-duration-format');

// regex for [[hh:]mm:]ss[.SSS] format
const timeRegex = /^(\d+(?=:\d+:))?:?(\d+(?=:))?:?(\d+)\.?(\d+)?$/;

// format used when representing time in output and filenames
const DURATION_FORMAT_TEXT = 'hh:mm:ss.SSS';
const DURATION_FORMAT_FILE = 'hh-mm-ss-SSS';

// always show seconds in moment duration
const DURATION_FORMAT_SETTINGS = { stopTrim: 'm' };

// convert [[hh:]mm:]ss[.SSS] into a moment duration
function time2duration(str) {
  const matches = timeRegex.exec(str);

  const duration = matches ? moment.duration({
    hours: parseInt(matches[1]) || 0,
    minutes: parseInt(matches[2]) || 0,
    seconds: parseInt(matches[3]) || 0,
    milliseconds: matches[4] ? (parseInt(matches[4].padEnd(3, '0')) || 0) : 0
  }) : null;

  if (!duration || !duration.isValid()) {
    throw new Error(`Invalid time "${str}"`);
  }

  return duration;
}

function extractCommand(argv) {

  if (argv.ffmpegPath) {
    ffmpeg.setFfmpegPath(argv.ffmpegPath);
  }

  if (!argv.startTime && !argv.duration && !argv.extractAudio) {
    if (!argv.quiet) {
      console.log('No start time given and not asked to extract audio so... SUCCESS!');
    }

    return;
  }

  const inFile = path.resolve(argv.inFile);

  const startTime = argv.startTime || moment.duration();

  let endTime, duration;

  if (argv.endTime) {
    endTime = argv.endTime;
    duration = moment.duration(endTime.asSeconds() - startTime.asSeconds(), 's');
  } else if (argv.duration) {
    duration = argv.duration;
    endTime = startTime.clone().add(argv.duration);
  }

  let outFile = path.resolve(path.basename(inFile, path.extname(inFile)));

  if (duration) {
    outFile += '--clip-' + startTime.format(DURATION_FORMAT_FILE) + '--' + (endTime ? endTime.format(DURATION_FORMAT_FILE) : 'end');
  }

  if (argv.extractAudio && !argv.format) {
    argv.format = 'mp3';
  }

  if (argv.format) {
    outFile += '.' + argv.format;
  } else {
    outFile += path.extname(inFile);
  }

  const cmd = ffmpeg(inFile);

  cmd.on('start', (cmdLine) => {
    // report what we are about to do
    if (!argv.quiet) {
      console.log(`In: ${inFile}`);
      console.log(`Out: ${outFile}`);
      console.log(`Start: ${startTime.format(DURATION_FORMAT_TEXT, DURATION_FORMAT_SETTINGS)}`);
      console.log(`End: ${endTime ? endTime.format(DURATION_FORMAT_TEXT, DURATION_FORMAT_SETTINGS) : 'Eof'}`);
      console.log(`Duration: ${duration ? duration.format(DURATION_FORMAT_TEXT, DURATION_FORMAT_SETTINGS) : 'Unknown'}`);

      if (argv.extractAudio) {
        console.log('Extracting audio only');
      }

      if (argv.verbose) {
        console.log(`Executing: ${cmdLine}`)
      }
    }
  });

  cmd.on('error', (err) => {
    console.error(err.message);
  });

  if (startTime) {
    cmd.seekInput(startTime.asSeconds());
  }

  if (duration) {
    cmd.duration(duration.asSeconds());
  }

  if (argv.extractAudio) {
    cmd
      .noVideo()
      .outputOptions([
        '-q:a 2'
      ]);
  } else if (argv.copy) {
    cmd
      .videoCodec('copy');
  } else {
    cmd.outputOptions([
      '-preset ultrafast',
      '-crf 18'
    ])
  }

  cmd.save(outFile);
}

yargs
  .usage('$0 <in-file> [start-time] [end-time]', 'Extract part of a media file', (yargs) => {
    yargs
      .positional('in-file', {
        describe: 'Path to input file'
      })
      .positional('start-time', {
        describe: 'Start position',
        coerce: time2duration
      })
      .positional('end-time', {
        describe: 'End position',
        coerce: time2duration
      });
  }, extractCommand)
  .option('copy', {
    describe: 'Copy streams instead of re-encoding. Faster and better quality, but less accurate seeking',
    type: 'boolean',
    alias: 'c'
  })
  .option('duration', {
    describe: 'Optional duration instead of end time',
    alias: 'd',
    coerce: time2duration
  })
  .option('extract-audio', {
    describe: 'Extract audio stream only',
    type: 'boolean',
    alias: 'x'
  })
  .option('format', {
    describe: 'Output file format',
    type: 'string',
    alias: 'f'
  })
  .option('ffmpeg-path', {
    describe: 'Path to ffmpeg binary if not found in environment',
    type: 'string',
    normalize: true
  })
  .option('quiet', {
    describe: 'No console output except for errors',
    type: 'boolean',
    alias: 'q'
  })
  .option('verbose', {
    describe: 'Show more information',
    type: 'boolean'
  })
  .help('help')
  .parse();