const fs = require('fs');
const ytdl = require('ytdl-core');

// YouTube video URL
const videoUrl = 'https://www.youtube.com/watch?v=VIDEO_ID';

// Output file path
const outputPath = 'output.mp4';

// Download function
const downloadVideo = async (url, outputPath) => {
  try {
    const videoInfo = await ytdl.getInfo(url);
    const formats = ytdl.filterFormats(videoInfo.formats, 'videoandaudio');

    // Choose a format (e.g., highest quality MP4 format)
    const mp4Format = formats.find(format => format.container === 'mp4');

    if (!mp4Format) {
      throw new Error('MP4 format not found');
    }

    const videoStream = ytdl(url, { format: mp4Format });
    videoStream.pipe(fs.createWriteStream(outputPath));

    videoStream.on('end', () => {
      console.log('Download complete');
    });
  } catch (error) {
    console.error('Error downloading video:', error);
  }
};

// Call the download function
downloadVideo(videoUrl, outputPath);