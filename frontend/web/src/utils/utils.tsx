export const dragBoundFunc = (
  stageWidth: number,
  stageHeight: number,
  vertexRadius: number,
  pos: { x: number; y: number },
) => {
  let x = pos.x;
  let y = pos.y;
  if (pos.x + vertexRadius > stageWidth) x = stageWidth;
  if (pos.x - vertexRadius < 0) x = 0;
  if (pos.y + vertexRadius > stageHeight) y = stageHeight;
  if (pos.y - vertexRadius < 0) y = 0;
  return { x, y };
};
export const minMax = (points: any[]) => {
  return points.reduce((acc, val) => {
    acc[0] = acc[0] === undefined || val < acc[0] ? val : acc[0];
    acc[1] = acc[1] === undefined || val > acc[1] ? val : acc[1];
    return acc;
  }, []);
};

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

export const hexStringToFile = (hexString: string, fileName: string) => {
  const mimeType = `image/${getFileExtension(fileName)}`;
  function hexStringToByteArray(hexString: string): Uint8Array {
    if (hexString.length % 2 !== 0) {
      throw new Error('Invalid hexString');
    }
    const byteArray = new Uint8Array(hexString.length / 2);
    for (let i = 0; i < byteArray.length; i++) {
      byteArray[i] = parseInt(hexString.substr(i * 2, 2), 16);
    }
    return byteArray;
  }

  // Step 2: Convert Byte Array to Blob
  function byteArrayToBlob(byteArray: Uint8Array, mimeType: string): Blob {
    return new Blob([byteArray], { type: mimeType });
  }

  // Convert hex string to byte array
  const byteArray = hexStringToByteArray(hexString);

  // Convert byte array to Blob (specify the correct MIME type)
  const blob = byteArrayToBlob(byteArray, mimeType);

  // Step 3: Convert Blob to File
  const file = new File([blob], fileName, { type: mimeType });
  return file;
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
    ans.push([p0, p1]);
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
    ans.push([p0, p1]);
  });
  return ans;
};
