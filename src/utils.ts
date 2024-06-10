export async function fileToBuffer(file: File) {
  const arrayBuffer = await file.arrayBuffer();

  return Buffer.from(arrayBuffer);
}
