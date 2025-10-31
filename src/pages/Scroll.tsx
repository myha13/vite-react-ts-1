import { useState, useEffect, useRef } from "react";
import * as handPoseDetection from "@tensorflow-models/hand-pose-detection";
// import * as tf from "@tensorflow/tfjs-core";
import "@tensorflow/tfjs-backend-webgl";

import "@mediapipe/hands";

const imagesPerPage = 5;

interface PicsumImage {
  id: number;
  height: number;
  width: number;
  download_url: string;
  url: string;
  author: string;
}

export default function ScrollPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [images, setImages] = useState<PicsumImage[]>([]);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const loadMoreRef = useRef<HTMLButtonElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Initialize tensorflow hand detector.
  useEffect(() => {
    if (!videoLoaded || !videoRef.current) return;

    const videoElement = videoRef.current;
    let detector: handPoseDetection.HandDetector | null = null;
    let isCleanedUp = false;
    let timer = 0;
    let isCleanedUpTimer = false;

    const disposeScroolByHands = () => {
      isCleanedUpTimer = true;

      if (timer) {
        clearInterval(timer);
      }
    };

    const scrollByHands = async () => {
      if (!detector) {
        return;
      }
      const hands = await detector.estimateHands(videoElement);

      if (isCleanedUpTimer) {
        disposeScroolByHands();
        return;
      }

      hands.forEach((hand: handPoseDetection.Hand) => {
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
      });
    };

    const disposeDetector = () => {
      isCleanedUp = true;

      if (detector && detector.dispose) {
        detector.dispose();
      }
    };

    const loadDetector = async () => {
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

      detector = await handPoseDetection.createDetector(model, detectorConfig);

      if (isCleanedUp) {
        disposeDetector();
        return;
      }

      timer = window.setInterval(() => {
        scrollByHands();
      }, 300);
    };

    const dispose = () => {
      disposeScroolByHands();
      disposeDetector();
    };

    loadDetector();

    return dispose;
  }, [videoLoaded]);

  // Start camera
  useEffect(() => {
    if (!videoRef.current) return;
    const videoElement = videoRef.current;

    let currentStream: MediaStream | null = null;
    let isCleanedUp = false;

    const stopCamera = () => {
      isCleanedUp = true;

      if (videoElement.srcObject === currentStream) {
        videoElement.srcObject = null;
        setVideoLoaded(false);
      }

      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };

    const startCamera = async () => {
      try {
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (isCleanedUp) {
          stopCamera();
          return;
        }

        videoElement.srcObject = currentStream;
        // videoRef.current.load();
        // @todo: cause issue: Uncaught (in promise) AbortError: The play() request was interrupted by a new load request.
        // videoRef.current.play();

        setVideoLoaded(true);
        // cameraManager.onVideoLoaded = () => setVideoLoaded(true);

        const videoTrack = currentStream.getVideoTracks()[0];
        videoTrack.addEventListener("ended", () => {
          stopCamera();
        });
      } catch (err) {
        console.error("Помилка доступу до камери: ", err);
        alert("Потрібен дозвіл на використання камери!");
      }
    };

    startCamera();

    return stopCamera;
  }, []);

  // Load images.
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const loadMoreHandler = () => {
      const apiUrl = `https://picsum.photos/v2/list?page=${currentPage}&limit=${imagesPerPage}`;

      loadJsonFromUrl(apiUrl).then((data) => {
        if (data) {
          setImages((prevImages) => [...prevImages, ...data]);
          setCurrentPage((prevPage) => prevPage + 1);
        } else {
          console.log("Failed to load JSON data.");
        }
      });
    };

    const options = {
      root: null,
      rootMargin: "0px",
      threshold: 1.0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          loadMoreHandler();
        }
      });
    }, options);

    observer.observe(loadMoreRef.current);

    return () => {
      observer.disconnect();
    };
  }, [currentPage]);

  return (
    <>
      <h1>Infinite Scroll</h1>
      <video ref={videoRef} playsInline autoPlay className="video"></video>
      <div className="images-container">
        {images.map((item) => (
          <img key={item.id} src={item.download_url} />
        ))}
        <button ref={loadMoreRef}>Load more</button>
      </div>
    </>
  );
}

async function loadJsonFromUrl(url: string): Promise<PicsumImage[] | null> {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const jsonData = await response.json();
    return jsonData;
  } catch (error) {
    console.error("Error loading JSON:", error);
    return null;
  }
}
