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
