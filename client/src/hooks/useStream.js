import { useState, useCallback } from 'react';

export const useStream = () => {
  const [stream, setStream] = useState(null);

  const startStream = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setStream(mediaStream);
      return mediaStream;
    } catch (error) {
      console.error('Error accessing media devices.', error);
      return null;
    }
  }, []);

  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  return { stream, startStream, stopStream };
};
