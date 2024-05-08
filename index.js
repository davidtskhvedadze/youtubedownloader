const fs = require('fs');
const os = require('os');
const ytdl = require('ytdl-core');

// YouTube video URL
const videoUrl = 'https://www.youtube.com/[EXAMPLE]';

// Output file paths
const videoOutputPath = `${os.homedir()}/Downloads/video.mp4`;
const audioOutputPath = `${os.homedir()}/Downloads/audio.mp3`;

// Download function
const downloadVideoAndAudio = async (url, videoOutputPath, audioOutputPath) => {
  try {
    const videoInfo = await ytdl.getInfo(url);
    const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestvideo' });
    const audioFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });

    if (!videoFormat || !audioFormat) {
      throw new Error('Format not found');
    }

    // Download video
    const videoStream = ytdl(url, { format: videoFormat });
    videoStream.pipe(fs.createWriteStream(videoOutputPath));

    // Download audio
    const audioStream = ytdl(url, { format: audioFormat });
    audioStream.pipe(fs.createWriteStream(audioOutputPath));

  } catch (error) {
    console.error('Error downloading video or audio:', error);
  }
};

downloadVideoAndAudio(videoUrl, videoOutputPath, audioOutputPath);