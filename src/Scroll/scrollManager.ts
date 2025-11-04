import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
// import "@tensorflow/tfjs-backend-webgl";

export default class scrollManager {
  isCleanedUp: boolean = false;
  isCleanedUpTimer: boolean = false;
  readonly videoElement: HTMLVideoElement;
  detector: handPoseDetection.HandDetector | null = null;
  timer: number = 0;

  constructor(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
  }

  disposeInterval = () => {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = 0;
    }
  };

  scrollByHands = async () => {
    if (!this.detector || this.isCleanedUp) {
      return;
    }

    const hands = await this.detector.estimateHands(this.videoElement);

    for (const hand of hands) {
      if (!hand.keypoints || hand.score < 0.5) return;

      const point0 = hand.keypoints.find(
        (keypoint) => keypoint.name === "wrist"
      );
      const point4 = hand.keypoints.find(
        (keypoint) => keypoint.name === "thumb_tip"
      );

      if (!point0 || !point4) return;

      if (point0.y < point4.y) {
        window.scrollBy({
          top: 100,
          behavior: "smooth",
        });
      } else {
        window.scrollBy({
          top: -100,
          behavior: "smooth",
        });
      }
    }
  };

  disposeDetector = () => {
    this.detector?.dispose();
    this.detector = null;
  };

  loadDetector = async () => {
    const model = handPoseDetection.SupportedModels.MediaPipeHands;

    const detectorConfig: handPoseDetection.MediaPipeHandsMediaPipeModelConfig =
      {
        runtime: "mediapipe", // or 'tfjs',
        solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/hands",
      };

    // // Load tensorflow with 'tfjs'.
    // await tf.setBackend("webgl");
    // await tf.ready();
    // const detectorConfig: handPoseDetection.MediaPipeHandsTfjsModelConfig = {
    //   runtime: "tfjs",
    //   // modelType: "full",
    //   // maxHands: 2,
    // };

    this.detector = await handPoseDetection.createDetector(
      model,
      detectorConfig
    );

    if (this.isCleanedUp) {
      this.dispose();
      return;
    }

    this.timer = window.setInterval(this.scrollByHands, 300);
  };

  dispose = () => {
    this.isCleanedUp = true;
    this.disposeInterval();
    this.disposeDetector();
  };
}
