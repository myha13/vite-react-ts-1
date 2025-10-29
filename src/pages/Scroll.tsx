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
  const [detector, setDetector] =
    useState<handPoseDetection.HandDetector | null>(null);
  const loadMoreRef = useRef<HTMLButtonElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Timer for getting video.
  useEffect(() => {
    if (!detector) return;

    const scrollByHands = async () => {
      const hands = await detector.estimateHands(videoRef.current!);

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
          console.log("scroll down");
        } else {
          window.scrollBy({
            top: -100,
            behavior: "smooth",
          });
          console.log("scroll up");
        }
      });
    };

    const timer = window.setInterval(() => {
      scrollByHands();
    }, 300);

    return () => {
      clearInterval(timer);
    };
  }, [detector]);

  // Initialize tensorflow hand detector.
  useEffect(() => {
    if (!videoLoaded) return;

    let detector: handPoseDetection.HandDetector | null = null;
    const loadDetector = async () => {
      const model = handPoseDetection.SupportedModels.MediaPipeHands;

      const detectorConfig: handPoseDetection.MediaPipeHandsMediaPipeModelConfig =
        {
          runtime: "mediapipe", // or 'tfjs',
          solutionPath: "node_modules/@mediapipe/hands",
          modelType: "full",
          maxHands: 2,
        };

      // Load tensorflow with 'tfjs'.
      // // await tf.setBackend("webgl");
      // // await tf.ready();
      // const detectorConfig: handPoseDetection.MediaPipeHandsTfjsModelConfig = {
      //   runtime: "tfjs",
      //   // modelType: "full",
      //   // maxHands: 2,
      // };

      detector = await handPoseDetection.createDetector(model, detectorConfig);
      setDetector(detector);
    };

    loadDetector();

    return () => {
      // @to fix: if run on load (dependencies - []) - Do not removes first initialed detector!
      if (detector && detector.dispose) {
        detector.dispose();
        setDetector(null);
        console.log("stopped detector.");
      }
    };
  }, [videoLoaded]);

  // Load video.
  useEffect(() => {
    if (!videoRef.current) return;

    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      if (!videoRef.current) return;

      try {
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        videoRef.current.srcObject = currentStream;
        // videoRef.current.load();
        // @todo: cause issue: Uncaught (in promise) AbortError: The play() request was interrupted by a new load request.
        // videoRef.current.play();

        setVideoLoaded(true);

        const videoTrack = currentStream.getVideoTracks()[0];
        videoTrack.onended = () => {
          console.log("Камера відключена або дозвіл відкликано!");
          stopCamera();
        };
      } catch (err) {
        console.error("Помилка доступу до камери: ", err);
        alert("Потрібен дозвіл на використання камери!");
      }
    };

    startCamera();

    const stopCamera = () => {
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
      setVideoLoaded(false);
    };

    return stopCamera();
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
