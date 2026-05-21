import { useEffect, useRef, useState } from "react";

type ProfilePhotoPanelProps = {
  isSaving: boolean;
  onChangePhoto: (photo: File) => void;
  onDeletePhoto: () => void;
  onCancel: () => void;
};

function ProfilePhotoPanel({
  isSaving,
  onChangePhoto,
  onDeletePhoto,
  onCancel,
}: ProfilePhotoPanelProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isOpeningCamera, setIsOpeningCamera] = useState(false);
  const [cameraError, setCameraError] = useState("");

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    if (!isCameraOpen || !videoRef.current || !streamRef.current) {
      return;
    }

    const video = videoRef.current;
    video.srcObject = streamRef.current;

    const playVideo = async () => {
      try {
        await video.play();
      } catch (error) {
        console.error(error);
        setCameraError("No se ha podido iniciar la vista previa de la cámara.");
      }
    };

    void playVideo();
  }, [isCameraOpen]);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    onChangePhoto(file);
    event.target.value = "";
  }

  async function openCamera() {
    setCameraError("");
    setIsOpeningCamera(true);

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Tu navegador no permite usar la cámara desde aquí.");
      setIsOpeningCamera(false);
      return;
    }

    try {
      let stream: MediaStream;

      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 1280 },
            height: { ideal: 1280 },
          },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      streamRef.current = stream;
      setIsCameraOpen(true);
    } catch (error) {
      console.error(error);
      setCameraError(
        "No se ha podido abrir la cámara. Revisa los permisos del navegador.",
      );
    } finally {
      setIsOpeningCamera(false);
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }

    setIsCameraOpen(false);
  }

  function capturePhoto() {
    const video = videoRef.current;

    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setCameraError(
        "La cámara todavía no está lista. Espera un segundo y vuelve a probar.",
      );
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext("2d");

    if (!context) {
      setCameraError("No se ha podido procesar la imagen.");
      return;
    }

    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          setCameraError("No se ha podido capturar la foto.");
          return;
        }

        const file = new File([blob], `profile-photo-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });

        stopCamera();
        onChangePhoto(file);
      },
      "image/jpeg",
      0.9,
    );
  }

  function handleCancel() {
    stopCamera();
    onCancel();
  }

  return (
    <div className="profile-photo-panel">
      <p className="profile-photo-text">
        Puedes subir una imagen desde tu dispositivo o sacar una foto con la
        cámara.
      </p>

      {cameraError && <p className="app-error">{cameraError}</p>}

      {isCameraOpen && (
        <div className="profile-camera-preview">
          <video ref={videoRef} autoPlay playsInline muted />
        </div>
      )}

      <div className="profile-photo-actions">
        {!isCameraOpen ? (
          <>
            <label className="profile-photo-button profile-photo-button-primary">
              Seleccionar archivo
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileChange}
                disabled={isSaving || isOpeningCamera}
              />
            </label>

            <button
              type="button"
              className="profile-photo-button profile-photo-button-secondary"
              onClick={openCamera}
              disabled={isSaving || isOpeningCamera}
            >
              {isOpeningCamera ? "Abriendo..." : "Sacar foto"}
            </button>

            <button
              type="button"
              className="profile-photo-button profile-photo-button-danger"
              onClick={onDeletePhoto}
              disabled={isSaving || isOpeningCamera}
            >
              Borrar imagen
            </button>

            <button
              type="button"
              className="profile-photo-button profile-photo-button-cancel"
              onClick={handleCancel}
              disabled={isSaving || isOpeningCamera}
            >
              Cancelar
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="profile-photo-button profile-photo-button-primary"
              onClick={capturePhoto}
              disabled={isSaving}
            >
              Usar foto
            </button>

            <button
              type="button"
              className="profile-photo-button profile-photo-button-secondary"
              onClick={stopCamera}
              disabled={isSaving}
            >
              Cerrar cámara
            </button>

            <button
              type="button"
              className="profile-photo-button profile-photo-button-cancel"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancelar
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default ProfilePhotoPanel;
