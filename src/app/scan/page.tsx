"use client";

import { useEffect, useRef, useState } from "react";
import jsQR from "jsqr";

export default function ScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [result, setResult] = useState<string>("");

  useEffect(() => {
    const startCamera = async () => {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      if (!videoRef.current) return;
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      scanLoop();
    };

    const scanLoop = () => {
      if (!canvasRef.current || !videoRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const qr = jsQR(imageData.data, canvas.width, canvas.height);

      if (qr) setResult(qr.data);

      requestAnimationFrame(scanLoop);
    };

    startCamera();
  }, []);

  return (
    <div className="flex flex-col items-center p-4 text-center">
      <h1 className="text-3xl font-bold mb-4">📷 QR 코드 스캔</h1>

      <div className="w-full max-w-md rounded-xl overflow-hidden shadow-lg border border-gray-300">
        <video ref={videoRef} className="w-full" />
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-6 w-full max-w-md">
        <div className="p-4 bg-gray-100 rounded-xl shadow-inner border">
          <p className="text-lg font-semibold text-gray-700">스캔 결과</p>
          <p className="mt-2 text-gray-900 wrap-break-word">
            {result ? result : "아직 스캔된 데이터가 없습니다."}
          </p>
        </div>
      </div>

      {result && (
        <button
          className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 transition"
          onClick={() => navigator.clipboard.writeText(result)}
        >
          결과 복사하기
        </button>
      )}
    </div>
  );
}
