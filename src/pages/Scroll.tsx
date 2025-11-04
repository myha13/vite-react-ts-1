import { useState, useEffect, useRef } from "react";
import cameraManager from "./../Scroll/cameraManager.ts";
import scrollManager from "./../Scroll/scrollManager.ts";

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
    const scrollManagerObj = new scrollManager(videoRef.current);
    scrollManagerObj.loadDetector();
    return () => scrollManagerObj.dispose();
  }, [videoLoaded]);

  // Start camera
  useEffect(() => {
    if (!videoRef.current) return;
    const cameraManagerObj = new cameraManager(videoRef.current);
    cameraManagerObj.onVideoLoaded = setVideoLoaded;
    cameraManagerObj.startCamera();
    return () => cameraManagerObj.stopCamera();
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
