

interface UploadFileToStorageParams {
  file: File
  onProgress: (sizeInBytes: number) => void
}

interface uploadFileToStorageOpts {
  signal?: AbortSignal
}

export async function uploadFileToStorage(
  { file, onProgress }: UploadFileToStorageParams,
  opts?: uploadFileToStorageOpts
) {
  // Convert file to base64
  const toBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

  return new Promise<{ url: string }>(async (resolve, reject) => {
    try {
      // Check for abortion immediately
      if (opts?.signal?.aborted) {
        reject(new Error('canceled'));
        return;
      }

      // Simulate a network upload delay (e.g. 2.5s)
      const duration = 2500;
      const intervalMs = 100;
      const totalSteps = duration / intervalMs;
      let currentStep = 0;

      const progressInterval = setInterval(() => {
        if (opts?.signal?.aborted) {
          clearInterval(progressInterval);
          reject(new Error('canceled'));
          return;
        }

        currentStep++;
        const progress = Math.min((currentStep / totalSteps) * file.size, file.size);
        onProgress(progress);

        if (currentStep >= totalSteps) {
          clearInterval(progressInterval);
        }
      }, intervalMs);

      const base64String = await toBase64(file);

      // Wait for the simulated upload duration before resolving
      setTimeout(() => {
        if (opts?.signal?.aborted) {
          reject(new Error('canceled'));
          return;
        }

        const uploadsDataString = localStorage.getItem('uploads_demo_data');
        const uploadsData = uploadsDataString ? JSON.parse(uploadsDataString) : [];

        // Save data with a fake ID/URL
        const fileData = {
          id: crypto.randomUUID(),
          name: file.name,
          base64: base64String,
          createdAt: new Date().toISOString()
        };
        
        uploadsData.push(fileData);
        localStorage.setItem('uploads_demo_data', JSON.stringify(uploadsData));

        // Use the base64 string directly as the url so it works as an image source if needed
        resolve({ url: base64String });
      }, duration);

    } catch (error) {
      reject(error);
    }
  });
}