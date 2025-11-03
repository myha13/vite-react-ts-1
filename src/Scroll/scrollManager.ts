import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";

export default class scrollManager {
  isCleanedUp: boolean = false;
  isCleanedUpTimer: boolean = false;
  readonly videoElement: HTMLVideoElement;
  detector: handPoseDetection.HandDetector | null = null;
  timer: number = 0;

  constructor(videoElement: HTMLVideoElement) {
    this.videoElement = videoElement;
  }

  disposeScroolByHands = () => {
    this.isCleanedUpTimer = true;

    if (this.timer) {
      clearInterval(this.timer);
    }
  };

  scrollByHands = async () => {
    if (!this.detector) {
      return;
    }
    const hands = await this.detector.estimateHands(this.videoElement);

    if (this.isCleanedUpTimer) {
      this.disposeScroolByHands();
      return;
    }

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
    this.isCleanedUp = true;

    if (this.detector && this.detector.dispose) {
      this.detector.dispose();
    }
  };

  loadDetector = async () => {
    const model = handPoseDetection.SupportedModels.MediaPipeHands;

    const detectorConfig: handPoseDetection.MediaPipeHandsMediaPipeModelConfig =
      {
        runtime: "mediapipe", // or 'tfjs',
        solutionPath: "node_modules/@mediapipe/hands",
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
      this.disposeDetector();
      return;
    }

    this.timer = window.setInterval(() => {
      this.scrollByHands();
    }, 300);
  };

  dispose = () => {
    this.disposeScroolByHands();
    this.disposeDetector();
  };
}
