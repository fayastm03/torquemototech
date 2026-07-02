// utils/imageUpload.js
// WHY: Compresses local image files and converts them to Base64 strings.
// This allows admins to upload images from their computer, which are saved
// directly into MongoDB Atlas, bypassing Render's temporary local storage!

export const compressAndConvertToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        // Create canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Calculate new dimensions (max 800px width/height to keep size small)
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        // Draw image onto canvas
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas content to compressed JPEG Base64
        // 0.7 quality gives excellent balance of clarity and small file size (approx 30KB - 80KB)
        const base64Url = canvas.toDataURL("image/jpeg", 0.7);
        resolve(base64Url);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};
