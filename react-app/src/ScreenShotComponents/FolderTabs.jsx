import React from "react";

const FolderTabs = ({
  folderList,
  selectedDate,
  selectedUser,
  displayImagesForFolder,
}) => (
  <div className="folder-tabs user-list imgtab">
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
            style={{
              width: "44px",
              height: "44px",
              border: "1px solid rgb(183 183 183)",
              borderRadius: "50%",
              marginRight: "15px",
            }}
            alt={`User ${index}`}
            loading="lazy"
          />
          {folder.user}
        </div>
      </div>
    ))}
  </div>
);

export default FolderTabs;
