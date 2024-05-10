const fs = require('fs');
const os = require('os');
const ytdl = require('ytdl-core');
const progress = require('progress');
const progressStream = require('progress-stream');

// YouTube video URL
const videoUrl = 'https://www.youtube.com/[EXMAPLE]';

// Output file paths
const videoOutputPath = `${os.homedir()}/Downloads/video.mp4`;
const audioOutputPath = `${os.homedir()}/Downloads/audio.mp3`;

// Download function
// Download function
const downloadVideoAndAudio = async (url, videoOutputPath, audioOutputPath) => {
  try {
    const videoInfo = await ytdl.getInfo(url);
    const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: '137' });
    const audioFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });

    if (!videoFormat || !audioFormat) {
      throw new Error('Format not found');
    }

    // Download video
    await new Promise((resolve, reject) => {
      const videoStream = ytdl(url, { format: videoFormat });
      const videoProgStream = progressStream({
        length: videoFormat.contentLength,
        time: 100 /* ms */
      });
      const videoBar = new progress('downloading video [:bar] :percent :etas', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: parseInt(videoFormat.contentLength),
      });
      videoProgStream.on('progress', (progress) => {
        videoBar.tick(progress.delta);
      });
      videoStream.pipe(videoProgStream).pipe(fs.createWriteStream(videoOutputPath))
        .on('finish', resolve)
        .on('error', reject);
    });

    // Download audio
    await new Promise((resolve, reject) => {
      const audioStream = ytdl(url, { format: audioFormat });
    
      // Estimate the total size of the audio file
      const total = audioFormat.bitrate * audioFormat.approxDurationMs / 8000; // bitrate is in bits per second and duration is in milliseconds, so we divide by 8000 to get the size in bytes
    
      const audioProgStream = progressStream({
        length: total,
        time: 100 /* ms */
      });
    
      // console.log(audioFormat); // Log the audioFormat object
    
      const audioBar = new progress('downloading audio [:bar] :percent :etas', {
        complete: '=',
        incomplete: ' ',
        width: 20,
        total: total,
      });
      audioProgStream.on('progress', (progress) => {
        audioBar.tick(progress.delta);
      });
      audioStream.pipe(audioProgStream).pipe(fs.createWriteStream(audioOutputPath))
        .on('finish', () => {
          console.log('\nDownload complete');
          resolve();
        })
        .on('error', reject);
    });

  } catch (error) {
    console.error('Error downloading video or audio:', error);
  }
};

downloadVideoAndAudio(videoUrl, videoOutputPath, audioOutputPath);