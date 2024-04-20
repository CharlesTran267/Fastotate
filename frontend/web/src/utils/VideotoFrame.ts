export enum VideoToFramesMethod {
  fps,
  totalFrames,
}

const maxFrame = 100;
const minFrame = 10;

export class VideoToFrames {
  /**
   * Extracts frames from the video and returns them as an array of imageData
   * @param videoUrl url to the video file (html5 compatible format) eg: mp4
   * @param amount number of frames per second or total number of frames that you want to extract
   * @param type [fps, totalFrames] The method of extracting frames: Number of frames per second of video or the total number of frames acros the whole video duration. defaults to fps
   */
  public static getFrames(
    videoUrl: string,
    amount: number = 10,
    type: VideoToFramesMethod = VideoToFramesMethod.fps,
  ): Promise<File[]> {
    return new Promise(
      (resolve: (frames: File[]) => void, reject: (error: string) => void) => {
        let frames: File[] = [];
        let canvas: HTMLCanvasElement = document.createElement('canvas');
        let context: CanvasRenderingContext2D = canvas.getContext('2d')!;
        let duration: number;

        let video = document.createElement('video');
        video.preload = 'auto';
        let that = this;
        video.addEventListener('loadeddata', async function () {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          duration = video.duration;

          let totalFrames: number = amount;
          if (type === VideoToFramesMethod.fps) {
            totalFrames = duration * amount;
          }
          if (totalFrames > maxFrame) {
            totalFrames = maxFrame;
          } else if (totalFrames < minFrame) {
            totalFrames = minFrame;
          }
          for (let time = 0; time < duration; time += duration / totalFrames) {
            const start = performance.now();
            frames.push(await that.getVideoFrame(video, context, canvas, time));
            const end = performance.now();
            console.log('Time to extract frame:', end - start);
          }
          resolve(frames);
        });
        video.src = videoUrl;
        video.load();
      },
    );
  }

  private static getVideoFrame(
    video: HTMLVideoElement,
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    time: number,
  ): Promise<File> {
    return new Promise(
      (resolve: (frame: File) => void, reject: (error: string) => void) => {
        let eventCallback = () => {
          video.removeEventListener('seeked', eventCallback);
          this.storeFrame(video, context, canvas, time, resolve);
        };
        video.addEventListener('seeked', eventCallback);
        video.currentTime = time;
      },
    );
  }

  private static storeFrame(
    video: HTMLVideoElement,
    context: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    time: number,
    resolve: (frame: File) => void,
  ) {
    const start = performance.now();
    context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    canvas.toBlob((blob) => {
      resolve(new File([blob!], `frame-${time}.png`, { type: 'image/png' }));
    });
    const end = performance.now();
    console.log('Time to store frame:', end - start);
  }
}
