import { useState, useEffect, useRef } from "react";

export default function CameraImage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  // const currentStreamRef = useRef<MediaStream | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current || !imgRef.current) return;

    let currentStream: MediaStream | null = null;

    const startCamera = async () => {
      if (!videoRef.current) return;

      try {
        // currentStreamRef.current = await navigator.mediaDevices.getUserMedia({
        currentStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        setStream(currentStream);

        // videoRef.current.srcObject = currentStreamRef.current;
        videoRef.current.srcObject = currentStream;
        videoRef.current.load();
        videoRef.current.play();
      } catch (err) {
        console.error("Помилка доступу до камери: ", err);
        alert("Потрібен дозвіл на використання камери!");
      }
    };

    // Запускаємо камеру одразу при завантаженні
    startCamera();

    // return stopCamera();
    console.log("Камера старт.");
    // console.log(currentStreamRef.current);
    return () => {
      console.log("Камера зупиняється.");
      // console.log(currentStreamRef.current);
      console.log(currentStream);
      console.log(videoRef.current);

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      if (currentStream) {
        // currentStreamRef.current.getTracks().forEach((track) => track.stop());
        // currentStreamRef.current = null;
        currentStream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }

      console.log("Камера зупинена.");
    };
  }, []);

  function capturePhoto() {
    if (!canvasRef.current || !videoRef.current || !imgRef.current) return;

    // if (!currentStreamRef.current) {
    if (!stream) {
      alert("Спочатку запустіть камеру!");
      return;
    }

    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;

    const context = canvasRef.current.getContext("2d");
    if (!context) return;

    context.drawImage(
      videoRef.current,
      0,
      0,
      canvasRef.current.width,
      canvasRef.current.height
    );

    imgRef.current.src = canvasRef.current.toDataURL("image/png");
  }

  return (
    <>
      <video ref={videoRef} playsInline></video>
      <button onClick={capturePhoto}>Зробити фото</button>
      <canvas ref={canvasRef}></canvas>
      <img ref={imgRef} alt="Знімок з камери" />
    </>
  );
}
