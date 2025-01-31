export async function uploadImageBase64(base64String: string) {
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

  return await uploadImageBlob(blob);
}

const mockedResponse = {
  explanation:
    "The equation shown is \\( y = ax^2 + b \\), which is a form of a quadratic function. This represents a parabola that opens upwards if \\( a > 0 \\) and downwards if \\( a < 0 \\).\n\n### Key Characteristics of Quadratic Functions\n\n1. **Standard Form**: \n   - The standard form of a quadratic equation is \\( y = ax^2 + bx + c \\).\n   - In this specific equation, the \\( b \\) term is missing, indicating that the parabola is symmetric about the y-axis if \\( b = 0 \\).\n\n2. **Vertex**:\n   - The vertex of a parabola in standard form \\( y = ax^2 + bx + c \\) is given by \\( x = -\\frac{b}{2a} \\).\n   - In this equation \\( y = ax^2 + b \\), the vertex is at the point \\( (0, b) \\).\n\n3. **Axis of Symmetry**:\n   - The axis of symmetry is the vertical line that passes through the vertex. For this equation, it is \\( x = 0 \\).\n\n4. **Direction**:\n   - The coefficient \\( a \\) determines the direction of the parabola.\n   - If \\( a > 0 \\), the parabola opens upwards.\n   - If \\( a < 0 \\), it opens downwards.\n\n5. **Y-intercept**:\n   - The y-intercept is the point where the parabola crosses the y-axis, which occurs when \\( x = 0 \\). Thus, the y-intercept is \\( (0, b) \\).\n\n### Graphical Representation\n\n- **Shape**: The graph is a U-shaped curve if \\( a > 0 \\) or an upside-down U if \\( a < 0 \\).\n- **Width**: The value of \\( a \\) affects the width of the parabola. A larger absolute value of \\( a \\) makes the parabola narrower, while a smaller absolute value makes it wider.\n\n### Applications\n\nQuadratic functions model various real-world scenarios, such as projectile motion, where the path of an object thrown into the air forms a parabola. They are also used in business to model profit functions, in physics for calculating areas and volumes, and in many other fields.\n\nUnderstanding quadratic functions is fundamental in algebra and calculus, as they form the basis for more complex mathematical concepts.",
};

const useMock = false;

export const uploadImageBlob = async (blob: Blob) => {
  // Create FormData and append the image Blob
  const formData = new FormData();
  formData.append("image", blob, "upload.png"); // The key 'image' matches what the Flask code expects

  if (useMock) {
    return mockedResponse;
  }

  // Send the request with multipart form data
  try {
    const response = await fetch("http://127.0.0.1:5000/upload", {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      const data = await response.json();
      console.log("Upload successful:", data);
      return data;
    } else {
      console.error("Upload failed:", await response.json());
    }
  } catch (error) {
    console.error("Error uploading image:", error);
  }
};
