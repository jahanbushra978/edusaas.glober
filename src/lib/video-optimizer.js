/**
 * Browser-side Video Optimizer
 * Automatically compresses large video files (>90MB) down to ~30-60MB in the browser
 * using HTML5 Canvas & MediaRecorder before upload.
 */
export async function optimizeVideo(file, targetMaxBytes = 90 * 1024 * 1024) {
  // If file is already under 90MB, skip browser compression
  if (!file || file.size <= targetMaxBytes) {
    return file;
  }

  console.log(`[Video Optimizer] Video size (${Math.round(file.size / (1024 * 1024))}MB) exceeds 90MB limit. Starting HD compression...`);

  return new Promise((resolve) => {
    try {
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      // 3-minute timeout so large videos compress completely without timing out
      const timer = setTimeout(() => {
        console.warn("[Video Optimizer] Compression timeout, proceeding with original file.");
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      }, 180000);

      video.onloadedmetadata = async () => {
        try {
          const canvas = document.createElement("canvas");
          let width = video.videoWidth || 1280;
          let height = video.videoHeight || 720;
          const maxW = 1280;

          if (width > maxW) {
            height = Math.round((height * maxW) / width);
            width = maxW;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          const stream = canvas.captureStream(30);

          let mimeType = "video/webm;codecs=vp9";
          if (typeof MediaRecorder !== "undefined") {
            if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "video/webm;codecs=vp8";
            if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "video/webm";
            if (!MediaRecorder.isTypeSupported(mimeType)) mimeType = "video/mp4";
          }

          if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported(mimeType)) {
            clearTimeout(timer);
            URL.revokeObjectURL(objectUrl);
            return resolve(file);
          }

          const recorder = new MediaRecorder(stream, {
            mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
            videoBitsPerSecond: 1_800_000, // 1.8 Mbps (Crisp 720p HD, ~13MB per minute)
          });

          const recordedChunks = [];
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) recordedChunks.push(e.data);
          };

          recorder.onstop = () => {
            clearTimeout(timer);
            URL.revokeObjectURL(objectUrl);
            if (recordedChunks.length === 0) return resolve(file);

            const compressedBlob = new Blob(recordedChunks, { type: mimeType || "video/webm" });
            const ext = mimeType.includes("mp4") ? ".mp4" : ".webm";
            const compressedFile = new File(
              [compressedBlob],
              file.name.substring(0, file.name.lastIndexOf(".")) + ext,
              { type: mimeType || "video/webm", lastModified: Date.now() },
            );

            console.log(`[Video Optimizer] Done! ${Math.round(file.size / (1024 * 1024))}MB → ${Math.round(compressedFile.size / (1024 * 1024))}MB`);
            resolve(compressedFile);
          };

          recorder.start(100);
          video.playbackRate = 1.0; // 1.0x Normal Speed - Preserves 100% exact original duration
          await video.play();

          const drawFrame = () => {
            if (video.paused || video.ended) {
              if (recorder.state === "recording") recorder.stop();
              return;
            }
            ctx.drawImage(video, 0, 0, width, height);
            requestAnimationFrame(drawFrame);
          };

          drawFrame();
        } catch (err) {
          clearTimeout(timer);
          console.warn("[Video Optimizer] Canvas compression error, using original:", err);
          URL.revokeObjectURL(objectUrl);
          resolve(file);
        }
      };

      video.onerror = () => {
        clearTimeout(timer);
        URL.revokeObjectURL(objectUrl);
        resolve(file);
      };
    } catch (e) {
      console.warn("[Video Optimizer] Exception fallback:", e);
      resolve(file);
    }
  });
}

/**
 * Extract a thumbnail frame from a Video file at 1.5s
 */
export async function captureVideoFrame(file, timeInSeconds = 1.5) {
  return new Promise((resolve) => {
    try {
      const video = document.createElement("video");
      video.muted = true;
      video.playsInline = true;
      video.crossOrigin = "anonymous";
      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      const timer = setTimeout(() => {
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      }, 10000);

      video.onloadeddata = () => {
        video.currentTime = Math.min(timeInSeconds, Math.max(0.1, video.duration - 0.5));
      };

      video.onseeked = () => {
        try {
          const canvas = document.createElement("canvas");
          const width = Math.min(video.videoWidth || 640, 640);
          const height = Math.round((width * (video.videoHeight || 360)) / (video.videoWidth || 640));

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(video, 0, 0, width, height);

          canvas.toBlob((blob) => {
            clearTimeout(timer);
            URL.revokeObjectURL(objectUrl);
            if (blob) {
              const frameFile = new File([blob], "thumbnail.jpg", { type: "image/jpeg" });
              resolve(frameFile);
            } else {
              resolve(null);
            }
          }, "image/jpeg", 0.85);
        } catch (_) {
          clearTimeout(timer);
          URL.revokeObjectURL(objectUrl);
          resolve(null);
        }
      };

      video.onerror = () => {
        clearTimeout(timer);
        URL.revokeObjectURL(objectUrl);
        resolve(null);
      };
    } catch (_) {
      resolve(null);
    }
  });
}
