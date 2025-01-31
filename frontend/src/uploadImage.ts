export async function uploadImage(base64String: string) {
  // Extract the base64 part of the string
  const base64Data = base64String.split(",")[1];

  // Convert base64 to binary data
  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);

  // Create a Blob from the binary data
  const blob = new Blob([byteArray], { type: "image/png" });

  // Create FormData and append the image Blob
  const formData = new FormData();
  formData.append("image", blob, "upload.png"); // The key 'image' matches what the Flask code expects

  // Send the request with multipart form data
  const response = await fetch("http://127.0.0.1:5000/upload", {
    method: "POST",
    body: formData,
  });

  if (response.ok) {
    const data = await response.json();
    console.log("Upload successful:", data);
  } else {
    console.error("Upload failed:", await response.json());
  }
}
