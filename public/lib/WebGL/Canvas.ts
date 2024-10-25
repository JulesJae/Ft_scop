export function resizeCanvasToDisplaySize(canvas: HTMLCanvasElement) {
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;
  const needResize = canvas.width !== displayWidth || canvas.height !== displayHeight;

  console.log(`resizeCanvas2Display width = ${displayWidth}, height = ${displayHeight}`);
  if (needResize) {
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
  return canvas
}