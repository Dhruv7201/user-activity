import React, { useState, useEffect } from "react";
import { get } from "../api/api.js";
import { useDateContext } from "../Context/DateContext.jsx";
import "./FileDownload.css";
import ImageGallery from "./ImageGallery";
import FolderTabs from "./FolderTabs";
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

const FileDownloader = () => {
  const { dateYmd } = useDateContext();
  const apiUrl = import.meta.env.VITE_API_URL;
  const [folderList, setFolderList] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loadingImage, setLoadingImage] = useState(true);
  const [loadFlag, setLoadFlag] = useState(true);

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
      .catch((error) => {});
  }, [dateYmd]);

  const displayImagesForFolder = (folderName) => {
    setSelectedUser(folderName);
    setLoadingImage(true);

    setLoadFlag(true);
  };

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
                    <></>
                  )}
                </div>
              </div>
              <div className="col-md-9">
                {true && (
                  <ImageGallery
                    setLoadFlag={setLoadFlag}
                    loadFlag={loadFlag}
                    folderList={folderList}
                    selectedDate={selectedDate}
                    selectedUser={selectedUser}
                    dateYmd={dateYmd}
                    setLoadingImage={setLoadingImage}
                    loadingImage={loadingImage}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDownloader;
