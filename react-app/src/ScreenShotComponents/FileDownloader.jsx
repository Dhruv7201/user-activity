import React, { useState, useEffect } from "react";
import { get } from "../api/api.js";
import { useDateContext } from "../Context/DateContext.jsx";
import "./FileDownload.css";
import Loading from "./loading.svg";

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

const FolderTabs = ({
  folderList,
  selectedDate,
  selectedUser,
  displayImagesForFolder,
}) => (
  <div className="folder-tabs user-list">
    {folderList.map((folder, index) => (
      <div
        key={index}
        className={`list ${
          folder.date === selectedDate && folder.user === selectedUser
            ? "active"
            : ""
        }`}
        onClick={() => displayImagesForFolder(folder.user)}
      >
        <div>
          <img
            src="/img.webp"
            className="user-img"
            alt={`User ${index}`}
            loading="lazy"
          />
          {folder.user}
        </div>
      </div>
    ))}
  </div>
);

const ImageGallery = ({
  folderList,
  selectedDate,
  selectedUser,
  openImageOverlay,
  imageStyle,
  dateYmd,
  apiUrl,
  setLoadingImage,
  loadingImage,
}) => (
  <div className="row">
    {folderList
      .find(
        (folder) => folder.date === selectedDate && folder.user === selectedUser
      )
      ?.files?.map((file, fileIndex) => (
        <div className="col-md-3 col-6 text-center" key={fileIndex}>
          <div className="image-overlay" style={{ position: "relative" }}>
            {loadingImage && <LoadingSpinner />}
            <img
              style={imageStyle}
              src={`${apiUrl}/download_file/${dateYmd}/${selectedUser}/${file}`}
              alt={`Image ${fileIndex + 1}`}
              onClick={() => openImageOverlay(file)}
              onLoad={() => setLoadingImage(false)}
            />

            <p style={{ textAlign: "center", marginTop: "5px" }}>
              {file.slice(0, -4)}
            </p>
          </div>
        </div>
      ))}
  </div>
);

const FileDownloader = () => {
  const { dateYmd } = useDateContext();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [folderList, setFolderList] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingImage, setLoadingImage] = useState(true);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape" && selectedImage) {
        setSelectedImage(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);

    const apiEndpoint = `/list_files?date=${dateYmd}&teamname=${localStorage.getItem(
      "teamname"
    )}`;
    get(apiEndpoint)
      .then((response) => {
        setFolderList(response.data);
        if (response.data.length > 0) {
          setSelectedDate(response.data[0].date);
          setSelectedUser(response.data[0].user);
        }
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [dateYmd]);

  const displayImagesForFolder = (folderName) => setSelectedUser(folderName);
  const openImageOverlay = (file) => setSelectedImage(file);
  const closeImageOverlay = () => setSelectedImage(null);

  const imageStyle = folderList.find(
    (folder) => folder.user === selectedUser && folder.date === selectedDate
  )?.imageStyle || {
    width: "150px",
    height: "80px",
    cursor: "pointer",
    margin: "0 10px",
  };

  return (
    <div className="card">
      <div className="card-body">
        <div
          className="file-downloader"
          style={{
            display: "flex",
            flexDirection: "column",
            fontFamily: "Arial, sans-serif",
            padding: "20px",
          }}
        >
          <div className="image-container">
            <div className="card-title">
              <h3>Screen Shots</h3>
            </div>
            <div className="row">
              <div className="col-md-3 col-12">
                <div className="user-table">
                  <div className="folder-tabs head user-list p-1 ps-3 pe-3">
                    <span style={{ float: "left" }}>User List</span>
                    <span style={{ float: "right" }}>
                      Total Users: {folderList.length}
                    </span>
                  </div>
                  {folderList.length > 0 ? (
                    <FolderTabs
                      folderList={folderList}
                      selectedDate={selectedDate}
                      selectedUser={selectedUser}
                      displayImagesForFolder={displayImagesForFolder}
                    />
                  ) : (
                    <p>No folders found with associated files.</p>
                  )}
                </div>
              </div>
              <div className="col-md-9">
                {!selectedImage && (
                  <ImageGallery
                    folderList={folderList}
                    selectedDate={selectedDate}
                    selectedUser={selectedUser}
                    openImageOverlay={openImageOverlay}
                    imageStyle={imageStyle}
                    dateYmd={dateYmd}
                    apiUrl={apiUrl}
                    setLoadingImage={setLoadingImage}
                    loadingImage={loadingImage}
                  />
                )}
              </div>
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
                  src={`${apiUrl}/download_file/${dateYmd}/${selectedUser}/${selectedImage}`}
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
        </div>
      </div>
    </div>
  );
};

export default FileDownloader;
