import { useEffect, useRef, useState } from "react";

type PhotoInputProps = {
  error?: string;
};

function PhotoInput({ error }: PhotoInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const previewUrlRef = useRef("");

  const [previewUrl, setPreviewUrl] = useState("");
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState("");

  function revokePreviewUrl() {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = "";
    }
  }

  function setPhotoPreview(file: File) {
    revokePreviewUrl();

    const nextPreviewUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextPreviewUrl;
    setPreviewUrl(nextPreviewUrl);
  }

  function stopCameraStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }

  function openFilePicker() {
    inputRef.current?.click();
  }

  function clearPhoto() {
    if (inputRef.current) {
      inputRef.current.value = "";
    }

    revokePreviewUrl();
    setPreviewUrl("");
  }

  function handleFileChange() {
    const file = inputRef.current?.files?.[0];

    if (!file) {
      clearPhoto();
      return;
    }

    setPhotoPreview(file);
  }

  async function openCamera() {
    setCameraError("");
    setIsCameraOpen(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError("No se ha podido acceder a la cámara.");
    }
  }

  function closeCamera() {
    stopCameraStream();
    setIsCameraOpen(false);
  }

  function capturePhoto() {
    const video = videoRef.current;
    const input = inputRef.current;

    if (!video || !input) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError("No se ha podido capturar la imagen.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("No se ha podido generar la imagen.");
          return;
        }

        const file = new File([blob], `photo-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        input.files = dataTransfer.files;

        setPhotoPreview(file);
        closeCamera();
      },
      "image/jpeg",
      0.9,
    );
  }

  useEffect(() => {
    return () => {
      stopCameraStream();
      revokePreviewUrl();
    };
  }, []);

  return (
    <div className="photo-input">
      <input
        ref={inputRef}
        className="photo-input-hidden"
        type="file"
        name="photo"
        accept="image/*"
        capture="user"
        onChange={handleFileChange}
      />

      {!previewUrl && (
        <>
          <div className="photo-input-actions">
            <button
              type="button"
              className="photo-input-button"
              onClick={openFilePicker}
            >
              Elegir archivo
            </button>

            <button
              type="button"
              className="photo-input-button"
              onClick={openCamera}
            >
              Hacer foto
            </button>
          </div>

          <span className="field-hint">
            Hazte un selfie o sube una foto tipo carnet.
          </span>
        </>
      )}

      {previewUrl && (
        <button
          type="button"
          className="photo-input-preview-button"
          onClick={clearPhoto}
          title="Quitar foto"
        >
          <img
            className="photo-input-preview"
            src={previewUrl}
            alt="Vista previa de la foto"
          />
          <span>Quitar foto</span>
        </button>
      )}

      {error && <span className="field-error">{error}</span>}

      {isCameraOpen && (
        <div className="camera-modal" role="dialog" aria-modal="true">
          <div className="camera-card">
            <h3>Hacer foto</h3>

            {cameraError ? (
              <p className="camera-error">{cameraError}</p>
            ) : (
              <video
                ref={videoRef}
                className="camera-video"
                autoPlay
                playsInline
                muted
              />
            )}

            <div className="camera-actions">
              {!cameraError && (
                <button
                  type="button"
                  className="primary-button"
                  onClick={capturePhoto}
                >
                  Usar esta foto
                </button>
              )}

              <button
                type="button"
                className="camera-secondary-button"
                onClick={closeCamera}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PhotoInput;
