import React, { useState, useEffect } from "react";
import Loading from "./loading.svg";
import "./FileDownload.css";

const LoadingSpinner = () => (
  <img
    src={Loading}
    alt="Loading..."
    style={{
      width: "50px",
      height: "50px",
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    }}
  />
);

const ImageGallery = ({
  setLoadFlag,
  loadFlag,
  folderList,
  selectedDate,
  selectedUser,
  dateYmd,
  setLoadingImage,
  loadingImage,
}) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const token = localStorage.getItem("token");

  // for pagination
  const [imageCount, setImageCount] = useState(1);

  // array containing images
  const [displayedImages, setDisplayedImages] = useState([]);
  const apiUrl = import.meta.env.VITE_API_URL;

  // Find the selected folder based on date and user
  const selectedFolder = folderList.find(
    (folder) => folder.date === selectedDate && folder.user === selectedUser
  );

  const closeImageOverlay = () => setSelectedImage(null);
  const openImageOverlay = (file) => setSelectedImage(file);

  const imageStyle = folderList.find(
    (folder) => folder.user === selectedUser && folder.date === selectedDate
  )?.imageStyle || {
    width: "150px",
    height: "80px",
    cursor: "pointer",
    margin: "0 10px",
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && selectedImage) {
        setSelectedImage(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage]);

  useEffect(() => {
    if (selectedFolder) {
      setDisplayedImages(selectedFolder.files.slice(0, 8 * imageCount));
    }
  }, [imageCount, selectedFolder]);

  const loadMoreImages = () => {
    if (selectedFolder) {
      const newImageCount = imageCount + 1;
      const newImages = selectedFolder.files.slice(
        8 * imageCount,
        8 * newImageCount
      );
      setDisplayedImages([...displayedImages, ...newImages]);
      setImageCount(newImageCount);
      setLoadingImage(true);
    }
  };

  return (
    <>
      <div className="row">
        {displayedImages.map((file, fileIndex) => (
          <div className="col-md-3 col-6 text-center" key={fileIndex}>
            <div className="image-overlay" style={{ position: "relative" }}>
              {fileIndex >= 8 * (imageCount - 1) && loadingImage && (
                <LoadingSpinner />
              )}

              <div style={imageStyle}>
                <img
                  src={`${apiUrl}/thumbnail_file/${dateYmd}/${selectedUser}/${file}/${token}`}
                  alt={`Image ${fileIndex + 1}`}
                  onClick={() => openImageOverlay(file)}
                  onLoad={() => {
                    setLoadingImage(false);
                    setLoadFlag(false);
                  }}
                  style={{
                    ...imageStyle,
                    visibility: loadFlag ? "hidden" : "visible",
                  }}
                  loading="lazy"
                />
              </div>
              <p style={{ textAlign: "center", marginTop: "5px" }}>
                {file.slice(0, -4).replace("_thumbnail", "")}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="row">
        <div className="col-md-12 text-center">
          <button
            onClick={loadMoreImages}
            className={`button-18 ${
              8 * imageCount >= selectedFolder?.files?.length ? "d-none" : ""
            }`}
            role="button"
          >
            View more
          </button>
        </div>
      </div>

      {selectedImage && (
        <div
          className="overlay"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0, 0, 0, 0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 999,
          }}
          onClick={closeImageOverlay}
        >
          <div
            className="popup-image-overlay"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <img
              src={`${apiUrl}/download_file/${dateYmd}/${selectedUser}/${selectedImage}/${token}`}
              alt={`Image`}
              style={{ ...imageStyle, width: "80%", height: "80%" }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <span
            style={{
              color: "white",
              position: "absolute",
              top: 10,
              right: 30,
              cursor: "pointer",
              fontSize: "30px",
            }}
            onClick={closeImageOverlay}
          >
            &times;
          </span>
        </div>
      )}
    </>
  );
};

export default ImageGallery;
