import React, { useState, useEffect } from "react";
import { get } from "../api/api.js";
import { useDateContext } from "../Context/DateContext.jsx";
import "./FileDownload.css";

const FileDownloader = () => {
  const [folderList, setFolderList] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const { dateYmd } = useDateContext();

  useEffect(() => {
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
  }, [dateYmd]);

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    fontFamily: "Arial, sans-serif",
    padding: "20px",
  };

  const folderTabStyle = {
    padding: "10px",
    cursor: "pointer",
    border: "1px solid #ccc",
    backgroundColor: "#f0f0f0",
  };

  const selectedFolderTabStyle = {
    ...folderTabStyle,
    backgroundColor: "lightblue",
    fontWeight: "bold",
  };

  const openImageOverlay = (file) => {
    setSelectedImage(file);
  };

  const closeImageOverlay = () => {
    setSelectedImage(null);
  };

  const displayImagesForFolder = (folderName) => {
    setSelectedUser(folderName);
  };

  const overlayStyle = {
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
  };

  const imageOverlayStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
  };

  const defaultImageStyle = {
    width: "150px",
    height: "80px",
    cursor: "pointer",
    margin: "0 10px",
  };

  const Users = { float: "left" };
  const totalUsers = { float: "right" };
  const userListBottom = { backgroundColor: "rgb(240, 240, 240)" };
  const imageStyle =
    folderList.find(
      (folder) => folder.user === selectedUser && folder.date === selectedDate
    )?.imageStyle || defaultImageStyle;
  const overlayImageStyle = {
    width: "80%",
    height: "80%",
  };
  const imageNameStyle = {
    textAlign: "center",
    marginTop: "5px",
  };
  const apiUrl = import.meta.env.VITE_API_URL;
  const imageDownloadUrl = `${apiUrl}/download_file/${dateYmd}/${selectedUser}/${selectedImage}`;

  return (
    <div className="card">
      <div className="card-body">
        <div className="file-downloader" style={containerStyle}>
          <div className="image-container">
            <div className="card-title">
              <h3>Screen Shots</h3>
            </div>
            <div className="row">
              <div className="col-md-3 col-12">
                <div className="user-table">
                  <div className="folder-tabs user-list p-1 ps-3 pe-3">
                    <span style={Users}>User List</span>
                    <span style={totalUsers}>
                      Total Users: {folderList.length}
                    </span>
                  </div>

                  {folderList.length > 0 ? (
                    <div className="folder-tabs user-list">
                      {folderList.map((folder, index) => (
                        <div
                          key={index}
                          style={
                            folder.date === selectedDate &&
                            folder.user === selectedUser
                              ? selectedFolderTabStyle
                              : folderTabStyle
                          }
                          onClick={() => displayImagesForFolder(folder.user)}
                        >
                          <div>
                            <img src="/img.webp" className="user-img" />
                            {folder.user}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p>No folders found with associated files.</p>
                  )}
                  <div className="mb-1"></div>
                </div>
              </div>
              <div className="col-md-9">
                {selectedImage ? null : (
                  <div className="row mt-3">
                    {folderList
                      .find(
                        (folder) =>
                          folder.date === selectedDate &&
                          folder.user === selectedUser
                      )
                      ?.files?.map((file, fileIndex) => (
                        <div
                          className="col-md-3 col-6 text-center"
                          key={fileIndex}
                        >
                          <img
                            style={imageStyle}
                            src={`${apiUrl}/download_file/${dateYmd}/${selectedUser}/${file}`}
                            alt={`Image ${fileIndex + 1}`}
                            onClick={() => openImageOverlay(file)}
                          />
                          <p style={imageNameStyle}>{file.slice(0, -4)}</p>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          {selectedImage && (
            <div
              className="overlay"
              style={overlayStyle}
              onClick={closeImageOverlay}
            >
              <div className="image-overlay" style={imageOverlayStyle}>
                <img
                  src={imageDownloadUrl}
                  alt={`Image`}
                  style={{ ...imageStyle, ...overlayImageStyle }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FileDownloader;
