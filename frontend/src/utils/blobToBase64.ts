export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      if (reader.result) {
        resolve(reader.result as string);
      } else {
        reject(new Error("Failed to convert blob to base64."));
      }
    };

    reader.onerror = () =>
      reject(new Error("An error occurred while reading the blob."));

    reader.readAsDataURL(blob);
  });
}
