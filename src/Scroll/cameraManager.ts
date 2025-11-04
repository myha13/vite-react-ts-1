export default class cameraManager {
  currentStream: MediaStream | null = null;
  isCleanedUp: boolean = false;
  readonly videoElement: HTMLVideoElement;
  onVideoLoaded: undefined | ((b: boolean) => void);

  constructor(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
  }

  // public onVideoLoaded(_videoLoaded: boolean) {}

  stopCamera = () => {
    this.isCleanedUp = true;

    if (this.videoElement.srcObject === this.currentStream) {
      this.videoElement.srcObject = null;
      this.onVideoLoaded?.(false);
    }

    if (this.currentStream) {
      this.currentStream.getTracks().forEach((track) => track.stop());
    }
  };

  startCamera = async () => {
    try {
      this.currentStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      if (this.isCleanedUp) {
        this.stopCamera();
        return;
      }

      this.videoElement.srcObject = this.currentStream;
      this.onVideoLoaded?.(true);

      const videoTrack = this.currentStream.getVideoTracks()[0];
      videoTrack.addEventListener("ended", () => {
        this.stopCamera();
      });
    } catch (err) {
      console.error("Помилка доступу до камери: ", err);
      // alert("Потрібен дозвіл на використання камери!");
    }
  };
}
