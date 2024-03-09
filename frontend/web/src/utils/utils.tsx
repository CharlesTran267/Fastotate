import axios from 'axios';

export const remToPixels = (rem: number) => {
  // Get the font-size of the root element (html)
  const rootFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize,
  );
  // Convert the rem value to pixels
  return rem * rootFontSize;
};

function getFileExtension(fileName: string): string {
  // Split the fileName by dot and get the last element of the array
  const parts = fileName.split('.');
  // If there's no extension or the fileName is just a dot (hidden files in Unix-like systems), return an empty string
  return parts.length > 1 ? parts[parts.length - 1] : '';
}

export const base64ToFile = (base64String: string, filename: string) => {
  // Convert the base64 string to a Blob
  const byteCharacters = atob(base64String);
  const byteArrays = [];

  for (let i = 0; i < byteCharacters.length; i++) {
    byteArrays.push(byteCharacters.charCodeAt(i));
  }

  const byteArray = new Uint8Array(byteArrays);

  const fileExt = getFileExtension(filename);
  const mime = `image/${fileExt}`;

  const blob = new Blob([byteArray], { type: mime });
  // Convert the Blob to a File
  return new File([blob], filename, { type: mime });
};

export const relativeToOriginalCoords = (
  points: any[],
  newSize: { width: number; height: number },
  oriSize: { width: number; height: number },
) => {
  if (points.length > 0 && typeof points[0] === 'number') {
    return [
      (points[0] / newSize.width) * oriSize.width,
      (points[1] / newSize.height) * oriSize.height,
    ];
  }
  let ans: number[][] = [];
  points.map((p: number[]) => {
    const p0 = (p[0] / newSize.width) * oriSize.width;
    const p1 = (p[1] / newSize.height) * oriSize.height;
    if (!isNaN(p0) && !isNaN(p1)) ans.push([p0, p1]);
  });
  return ans;
};

export const originalToRelativeCoords = (
  points: any[],
  newSize: { width: number; height: number },
  oriSize: { width: number; height: number },
) => {
  if (points.length > 0 && typeof points[0] === 'number') {
    return [
      (points[0] / oriSize.width) * newSize.width,
      (points[1] / oriSize.height) * newSize.height,
    ];
  }
  let ans: number[][] = [];
  points.map((p: number[]) => {
    const p0 = (p[0] / oriSize.width) * newSize.width;
    const p1 = (p[1] / oriSize.height) * newSize.height;
    if (!isNaN(p0) && !isNaN(p1)) ans.push([p0, p1]);
  });
  return ans;
};

export const createProject = async (session_token: string | null) => {
  const backendURL = process.env.NEXT_PUBLIC_API_URL;
  try {
    const response = await axios.post(`${backendURL}/create-project`, {
      token: session_token,
    });
    return response.data.data.project_id;
  } catch (error) {
    console.error('Error creating project:', error);
    return null;
  }
};
