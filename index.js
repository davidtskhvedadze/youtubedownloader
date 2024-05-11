const fs = require('fs');
const os = require('os');
const ytdl = require('ytdl-core');
const ProgressBar = require('progress');
const ffmpeg = require('fluent-ffmpeg');

// YouTube video URL
const videoUrl = 'https://www.youtube.com/watch?v=b_YodQJNsAM&t=3145s';

// Output file paths
const videoOutputPath = `${os.homedir()}/Downloads/video.mp4`;
const audioOutputPath = `${os.homedir()}/Downloads/audio.mp3`;
const outputPath = `${os.homedir()}/Downloads/converted2.mp4`;

// Download function
const downloadVideoAndAudio = async (url, videoOutputPath, audioOutputPath, outputPath) => {
  try {
    // Download video
    const videoInfo = await ytdl.getInfo(url);
    const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: '137' });
    const videoBar = new ProgressBar('downloading video [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: isNaN(parseInt(videoFormat.contentLength, 10)) ? 0 : parseInt(videoFormat.contentLength, 10),
    });
    const videoStream = ytdl.downloadFromInfo(videoInfo, { format: videoFormat });
    videoStream.on('progress', (chunkLength, downloaded, total) => {
      videoBar.update(downloaded / total);
    });
    videoStream.pipe(fs.createWriteStream(videoOutputPath));

    await new Promise((resolve) => videoStream.on('end', resolve))

    // Download audio
    const audioFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highestaudio' });
    const audioBar = new ProgressBar('downloading audio [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: 100, // Placeholder total
    });
    const audioStream = ytdl.downloadFromInfo(videoInfo, { format: audioFormat });
    audioStream.on('progress', (chunkLength, downloaded, total) => {
      audioBar.update(downloaded / total);
    });
    audioStream.pipe(fs.createWriteStream(audioOutputPath));

    // Wait for video and audio downloads to finish
    // await Promise.all([
      
    await new Promise((resolve) => audioStream.on('end', resolve))
    // ]);

    // Merge video and audio
    const mergingBar = new ProgressBar('merging [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 20,
      total: 100, // Placeholder total
    });
    ffmpeg()
      .input(videoOutputPath)
      .input(audioOutputPath)
      .outputOptions('-c:v', 'copy') // copy the video stream directly without re-encoding
      .outputOptions('-c:a', 'aac') // encode the audio stream to AAC
      .outputOptions('-map', '0:v:0') // use the video stream from the first input
      .outputOptions('-map', '1:a:0') // use the audio stream from the second input
      .on('progress', (progress) => {
        mergingBar.update(progress.percent / 100);
      })
      .on('error', console.error)
      .on('end', () => {
        fs.unlinkSync(videoOutputPath);
        fs.unlinkSync(audioOutputPath);
        console.log('Merging complete');
      })
      .save(outputPath);
  } catch (error) {
    console.error(error);
  }
};

downloadVideoAndAudio(videoUrl, videoOutputPath, audioOutputPath, outputPath);
