import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Button,
  Form,
  Table,
  Alert,
  Modal,
  Dropdown,
  DropdownButton,
} from "react-bootstrap";

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [users, setUsers] = useState([]);
  const [userRole, setUserRole] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [fileIdToDelete, setFileIdToDelete] = useState(null);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [permission, setPermission] = useState("view"); // Default permission
  const [expirationMinutes, setExpirationMinutes] = useState(30); // Default expiration time

  const onFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const onUpload = async () => {
    const formData = new FormData();
    formData.append("file", file);

    const accessToken = sessionStorage.getItem("access_token");

    try {
      const response = await axios.post(
        "https://localhost:443/upload_file",
        formData,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setMessage("File uploaded successfully");
      fetchFiles(); // Re-fetch the file list after successful upload
    } catch (error) {
      if (error.response && error.response.data.detail) {
        setMessage(`Error: ${error.response.data.detail}`);
      } else {
        setMessage("Error uploading file");
      }
    }
  };

  const fetchFiles = async () => {
    const accessToken = sessionStorage.getItem("access_token");
    try {
      const response = await axios.get("https://localhost:443/files", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setFiles(response.data);
    } catch (error) {
      console.error("Error fetching files:", error);
    }
  };

  const fetchUsers = async () => {
    const accessToken = sessionStorage.getItem("access_token");
    const loggedInUser = JSON.parse(sessionStorage.getItem("user"));
    try {
      const response = await axios.get("https://localhost:443/users", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // Filter out the logged-in user
      const filteredUsers = response.data.filter(
        (user) => user.username !== loggedInUser.username
      );
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    const user = sessionStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setUserRole(parsedUser.role); // Set the user role from parsed user data
    }
    fetchFiles();
  }, []);

  const downloadFile = async (fileId) => {
    const accessToken = sessionStorage.getItem("access_token");
    try {
      const response = await axios.get(
        `https://localhost:443/files/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: "blob",
        }
      );

      const file = files.find((f) => f.id === fileId);
      const fileName = file ? file.file_name : "downloaded-file";

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  const viewFile = async (fileId) => {
    const accessToken = sessionStorage.getItem("access_token");
    try {
      const response = await axios.get(
        `https://localhost:443/files/${fileId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: "blob",
        }
      );

      const file = files.find((f) => f.id === fileId);
      const fileName = file ? file.file_name : "file";

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error viewing file:", error);
    }
  };

  const handleDeleteClick = (fileId) => {
    setFileIdToDelete(fileId);
    setShowDeleteModal(true); // Show delete modal when delete button is clicked
  };

  const deleteFile = async () => {
    const accessToken = sessionStorage.getItem("access_token");
    try {
      await axios.delete(`https://localhost:443/files/${fileIdToDelete}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setMessage("File deleted successfully");
      fetchFiles();
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Error deleting file:", error);
      setMessage("Error deleting file");
    }
  };

  const handleShareClick = (fileId) => {
    setFileIdToDelete(fileId);
    fetchUsers();
    setShowShareModal(true); // Show share modal
  };

  const handleShareFile = async () => {
    const accessToken = sessionStorage.getItem("access_token");

    // Validate that at least one user and permission type are selected
    if (selectedUsers.length === 0) {
      setMessage("Please select at least one user to share the file with.");
      return;
    }

    try {
      await axios.post(
        "https://localhost:443/share_file",
        {
          file_id: fileIdToDelete,
          user_ids: selectedUsers,
          permission: permission, // Permission type: 'view' or 'download'
          expiration_minutes: expirationMinutes, // Expiration time
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      setMessage("File shared successfully");
      setShowShareModal(false);
      fetchFiles();
    } catch (error) {
      console.error("Error sharing file:", error);
      setMessage("Error sharing file");
    }
  };

  const handleModalClose = () => {
    setShowDeleteModal(false);
    setShowShareModal(false);
  };

  return (
    <div className="container mt-4">
      {(userRole === "Admin" || userRole === "Regular User") && (
        <>
          <h3>Upload File</h3>
          <Form>
            <Form.Group controlId="formFile" className="mb-3" style={{width:"fit-content"}}>
              <Form.Label>Choose file to upload</Form.Label>
              <Form.Control
                type="file"
                onChange={onFileChange}
                style={{
                  transition: "0.3s ease-in-out",
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                }}
              />
            </Form.Group>
            <Button
              variant="primary"
              onClick={onUpload}
              disabled={!file}
              style={{
                transition: "0.3s ease-in-out",
              }}
            >
              Upload
            </Button>
          </Form>
        </>
      )}

      {message && (
        <Alert
          variant={message.includes("successfully") ? "success" : "danger"}
          className="mt-3"
        >
          {message}
        </Alert>
      )}

      <h4 className="mt-4">Your Files</h4>
      {files.length > 0 ? (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>File Name</th>
              {userRole !== "Guest" && (
                <>
                  <th>Download</th>
                  <th>View</th>
                </>
              )}
              {userRole === "Admin" && (
                <>
                  <th>Delete</th>
                  <th>Share</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {files.map((file) => (
              <tr key={file.id}>
                <td>{file.file_name}</td>
                <td>
                  <Button
                    variant="success"
                    onClick={() => downloadFile(file.id)}
                  >
                    Download
                  </Button>
                </td>
                <td>
                  <Button variant="info" onClick={() => viewFile(file.id)}>
                    View
                  </Button>
                </td>
                {userRole === "Admin" && (
                  <>
                    <td>
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteClick(file.id)}
                      >
                        Delete
                      </Button>
                    </td>
                    <td>
                      <Button
                        variant="warning"
                        onClick={() => handleShareClick(file.id)}
                      >
                        Share
                      </Button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      ) : (
        <p>No files uploaded yet</p>
      )}

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Delete File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Are you sure you want to delete this file?</p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="danger" onClick={deleteFile}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Share Modal */}
      <Modal show={showShareModal} onHide={handleModalClose}>
        <Modal.Header closeButton>
          <Modal.Title>Share File</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <label>Users:</label>
            <select
              multiple
              onChange={(e) => {
                const selectedValues = Array.from(
                  e.target.selectedOptions,
                  (option) => option.value
                );
                setSelectedUsers(selectedValues);
              }}
              className="form-control"
            >
              {users.map((user) => (
                <option key={user.id} value={user.id} className="option-text">
                  {user.username}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-2">
            <label>Permission:</label>
            <DropdownButton
              id="dropdown-basic-button"
              title={permission === "view" ? "View" : "Download"}
              onSelect={(eventKey) => setPermission(eventKey)}
            >
              <Dropdown.Item eventKey="view">View</Dropdown.Item>
              <Dropdown.Item eventKey="download">Download</Dropdown.Item>
            </DropdownButton>
          </div>
          <div className="mt-2">
            <label>Expiration (minutes):</label>
            <input
              type="number"
              className="form-control"
              value={expirationMinutes}
              onChange={(e) =>
                setExpirationMinutes(Math.max(1, e.target.value))
              }
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleModalClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleShareFile}>
            Share File
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default FileUpload;
