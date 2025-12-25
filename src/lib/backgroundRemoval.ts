import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to always download models
env.allowLocalModels = false;
env.useBrowserCache = true;

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(
  canvas: HTMLCanvasElement, 
  ctx: CanvasRenderingContext2D, 
  image: HTMLImageElement
): boolean {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

interface SegmentationMask {
  label: string;
  score: number;
  mask: {
    data: Float32Array | Uint8Array;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let segmenterInstance: any = null;

async function getSegmenter() {
  if (!segmenterInstance) {
    segmenterInstance = await pipeline(
      'image-segmentation', 
      'Xenova/segformer-b0-finetuned-ade-512-512'
    );
  }
  return segmenterInstance;
}

export const removeBackground = async (
  imageElement: HTMLImageElement,
  onProgress?: (status: string) => void
): Promise<Blob> => {
  try {
    onProgress?.('Loading AI model...');
    const segmenter = await getSegmenter();
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    onProgress?.('Processing image...');
    resizeImageIfNeeded(canvas, ctx, imageElement);
    
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    
    onProgress?.('Removing background...');
    const result = await segmenter(imageData) as SegmentationMask[];
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    outputCtx.drawImage(canvas, 0, 0);
    
    const outputImageData = outputCtx.getImageData(0, 0, outputCanvas.width, outputCanvas.height);
    const data = outputImageData.data;
    
    const maskData = result[0].mask.data;
    
    
    for (let i = 0; i < maskData.length; i++) {
      const alpha = Math.round((1 - maskData[i]) * 255);
      data[i * 4 + 3] = alpha;
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    onProgress?.('Finalizing...');
    
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};
