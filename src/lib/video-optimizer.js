/**
 * Browser-side Video Optimizer
 * Automatically compresses large video files (>90MB) down to ~30-60MB in the browser
 * using HTML5 Canvas & MediaRecorder before upload.
 */
export async function optimizeVideo(file, targetMaxBytes = 150 * 1024 * 1024, onProgress) {
  // If file is already under 150MB (Cloudinary safe ceiling), skip compression
  if (!file || file.size <= targetMaxBytes) {
    return file;
  }

  console.log(`[Video Optimizer] Video size (${Math.round(file.size / (1024 * 1024))}MB) exceeds 150MB limit. Starting 720p HD compression with audio...`);

  return new Promise((resolve) => {
    try {
      const video = document.createElement("video");
      video.muted = false;
      video.volume = 1.0;
      video.playsInline = true;
      video.crossOrigin = "anonymous";
      video.style.position = "fixed";
      video.style.left = "-9999px";
      video.style.top = "-9999px";
      video.style.width = "1px";
      video.style.height = "1px";
      video.style.opacity = "0.01";
      video.style.pointerEvents = "none";
      document.body.appendChild(video);

      const objectUrl = URL.createObjectURL(file);
      video.src = objectUrl;

      let intervalId = null;

      const cleanup = () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
        try {
          if (video.parentNode) video.parentNode.removeChild(video);
        } catch (_) {}
        try {
          URL.revokeObjectURL(objectUrl);
        } catch (_) {}
      };

      // 5-minute timeout safety
      const timer = setTimeout(() => {
        console.warn("[Video Optimizer] Compression timeout, proceeding with original file.");
        cleanup();
        resolve(file);
      }, 300000);

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

          const canvasStream = canvas.captureStream(30);
          const videoTrack = canvasStream.getVideoTracks()[0];

          // Capture audio track (raw stream or WebAudio API) to guarantee sound is preserved
          let audioTrack = null;
          try {
            if (video.captureStream || video.mozCaptureStream) {
              const rawStream = video.captureStream ? video.captureStream() : video.mozCaptureStream();
              audioTrack = rawStream.getAudioTracks()[0] || null;
            }
          } catch (e) {
            console.warn("[Video Optimizer] Direct audio track capture fallback:", e);
          }

          if (!audioTrack) {
            try {
              const AudioCtx = window.AudioContext || window.webkitAudioContext;
              if (AudioCtx) {
                const audioCtx = new AudioCtx();
                if (audioCtx.state === "suspended") {
                  await audioCtx.resume().catch(() => {});
                }
                const source = audioCtx.createMediaElementSource(video);
                const dest = audioCtx.createMediaStreamDestination();
                source.connect(dest);
                audioTrack = dest.stream.getAudioTracks()[0] || null;
              }
            } catch (e) {
              console.warn("[Video Optimizer] WebAudio capture error:", e);
            }
          }

          const combinedStream = new MediaStream([
            videoTrack,
            ...(audioTrack ? [audioTrack] : [])
          ]);

          let mimeType = "video/webm;codecs=vp9,opus";
          if (typeof MediaRecorder !== "undefined") {
            if (MediaRecorder.isTypeSupported("video/mp4;codecs=avc1,mp4a")) mimeType = "video/mp4;codecs=avc1,mp4a";
            else if (MediaRecorder.isTypeSupported("video/mp4")) mimeType = "video/mp4";
            else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp9,opus")) mimeType = "video/webm;codecs=vp9,opus";
            else if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) mimeType = "video/webm;codecs=vp8,opus";
            else if (MediaRecorder.isTypeSupported("video/webm")) mimeType = "video/webm";
          }

          if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported(mimeType)) {
            clearTimeout(timer);
            cleanup();
            return resolve(file);
          }

          const recorder = new MediaRecorder(combinedStream, {
            mimeType: MediaRecorder.isTypeSupported(mimeType) ? mimeType : undefined,
            videoBitsPerSecond: 1_800_000, // Crisp 720p HD (~13MB/min)
          });

          const recordedChunks = [];
          recorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) recordedChunks.push(e.data);
          };

          recorder.onstop = () => {
            clearTimeout(timer);
            cleanup();
            if (recordedChunks.length === 0) return resolve(file);

            const compressedBlob = new Blob(recordedChunks, { type: mimeType || "video/webm" });
            const ext = mimeType.includes("mp4") ? ".mp4" : ".webm";
            const compressedFile = new File(
              [compressedBlob],
              file.name.substring(0, file.name.lastIndexOf(".")) + ext,
              { type: mimeType || "video/webm", lastModified: Date.now() }
            );

            console.log(`[Video Optimizer] Done! ${Math.round(file.size / (1024 * 1024))}MB → ${Math.round(compressedFile.size / (1024 * 1024))}MB`);
            resolve(compressedFile);
          };

          recorder.start(100);
          video.playbackRate = 1.0;
          await video.play().catch(() => {});

          const renderFrame = () => {
            const isFinished = video.ended || (video.duration > 0 && video.currentTime >= video.duration - 0.2);
            if (isFinished) {
              if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
              }
              if (recorder.state === "recording") recorder.stop();
              return;
            }
            if (video.paused && !video.ended) {
              video.play().catch(() => {});
            }
            ctx.drawImage(video, 0, 0, width, height);
            if (video.duration && onProgress) {
              const p = Math.min(99, Math.round((video.currentTime / video.duration) * 100));
              onProgress(p);
            }
            if (typeof video.requestVideoFrameCallback === "function") {
              video.requestVideoFrameCallback(renderFrame);
            }
          };

          if (typeof video.requestVideoFrameCallback === "function") {
            video.requestVideoFrameCallback(renderFrame);
          } else {
            intervalId = setInterval(renderFrame, 1000 / 30);
          }
          renderFrame();
        } catch (err) {
          clearTimeout(timer);
          console.warn("[Video Optimizer] Compression exception, proceeding with original:", err);
          cleanup();
          resolve(file);
        }
      };

      video.onerror = () => {
        clearTimeout(timer);
        cleanup();
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
