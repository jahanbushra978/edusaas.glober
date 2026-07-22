/**
 * Client-side Image Optimizer
 * Validates, resizes, compresses, and converts images to WebP format.
 */

/**
 * Determine the target size limit and type based on the label or folder name.
 */
export function determineImageTypeAndLimit(label = "", folder = "") {
  const context = (String(label) + " " + String(folder)).toLowerCase();
  
  if (
    context.includes("profile") || 
    context.includes("student photo") || 
    context.includes("teacher photo") || 
    context.includes("avatar") || 
    context.includes("user") ||
    context.includes("photo")
  ) {
    return {
      type: "profile",
      maxSize: 300 * 1024, // 300 KB
    };
  }
  
  if (
    context.includes("banner") || 
    context.includes("slide") || 
    context.includes("cover") || 
    context.includes("hero") || 
    context.includes("landscape") ||
    context.includes("background")
  ) {
    return {
      type: "banner",
      maxSize: 800 * 1024, // 800 KB
    };
  }

  // Default to gallery image size
  return {
    type: "gallery",
    maxSize: 500 * 1024, // 500 KB
  };
}

/**
 * Optimizes an image file (Resize -> Convert to WebP -> Compress to Target Size).
 * Bypasses optimization if the file is not a supported image type (e.g. PDFs, Word docs).
 */
export async function optimizeImage(file, label = "", folder = "") {
  // 1. Bypass check: If not a supported image format, skip optimization entirely
  const isSupportedImage = 
    file.type.startsWith("image/") && 
    (file.type.includes("jpeg") || file.type.includes("jpg") || file.type.includes("png") || file.type.includes("webp"));

  if (!isSupportedImage) {
    console.log(`Bypassing image optimization for non-image or unsupported format file: ${file.name}`);
    return { file, bypassed: true };
  }

  // 2. Determine target size constraints
  const { type, maxSize } = determineImageTypeAndLimit(label, folder);
  console.log(`Optimizing image: ${file.name} (Type: ${type}, Target Max Size: ${maxSize / 1024} KB)`);

  try {
    // 3. Load image into HTML Image object
    const img = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = (err) => reject(new Error("Failed to load image file into browser Image object."));
        image.src = e.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });

    // 4. Calculate new dimensions maintaining aspect ratio (Max width: 1920px)
    let width = img.width;
    let height = img.height;
    const maxWidth = 1920;
    
    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }

    // 5. Draw image onto Canvas
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    
    // Draw white background (especially for transparent PNGs converted to WebP)
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    // 6. Compress and convert to WebP with target size checking
    // Start with 80% compression quality
    let quality = 0.80;
    let optimizedBlob = await new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob), "image/webp", quality);
    });

    // If size exceeds target maximum, step quality down to 75%
    if (optimizedBlob.size > maxSize) {
      quality = 0.75;
      optimizedBlob = await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/webp", quality);
      });
    }

    // If still too large, step down size slightly (multiply dimensions by 0.85)
    let scaleCount = 0;
    while (optimizedBlob.size > maxSize && scaleCount < 3 && width > 400) {
      width = Math.round(width * 0.85);
      height = Math.round(height * 0.85);
      
      canvas.width = width;
      canvas.height = height;
      
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);
      
      optimizedBlob = await new Promise((resolve) => {
        canvas.toBlob((blob) => resolve(blob), "image/webp", quality);
      });
      scaleCount++;
    }

    // 7. Create new File object for upload
    const originalName = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
    const optimizedFile = new File([optimizedBlob], `${originalName}.webp`, {
      type: "image/webp",
      lastModified: Date.now(),
    });

    console.log(`Optimized image complete: ${optimizedFile.name} (Size: ${Math.round(optimizedFile.size / 1024)} KB, Quality: ${Math.round(quality * 100)}%)`);
    return { file: optimizedFile, type, bypassed: false };

  } catch (error) {
    console.error("Client side image optimization failed, falling back to original file:", error);
    return { file, bypassed: true };
  }
}
