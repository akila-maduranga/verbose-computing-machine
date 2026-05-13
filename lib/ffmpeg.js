import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpeg = null;

export const loadFFmpeg = async () => {
  if (ffmpeg) return ffmpeg;

  ffmpeg = new FFmpeg();
  
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
  
  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  return ffmpeg;
};

export const extractAudio = async (videoFile) => {
  const ffmpeg = await loadFFmpeg();
  
  const inputName = "input" + videoFile.name.substring(videoFile.name.lastIndexOf("."));
  const outputName = "output.mp3";

  await ffmpeg.writeFile(inputName, await fetchFile(videoFile));

  // Extract audio and compress to 32kbps MP3
  // -vn: no video
  // -b:a 32k: bitrate 32k
  await ffmpeg.exec(["-i", inputName, "-vn", "-b:a", "32k", outputName]);

  const data = await ffmpeg.readFile(outputName);
  return new Blob([data.buffer], { type: "audio/mp3" });
};
