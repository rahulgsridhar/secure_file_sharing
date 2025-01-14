import React, { useState } from 'react';
import axios from 'axios';

const FileShare = () => {
    const [fileId, setFileId] = useState('');
    const [userIds, setUserIds] = useState('');
    const [accessType, setAccessType] = useState('read');

    const onShareFile = async () => {
        try {
            const users = userIds.split(',').map(id => parseInt(id.trim(), 10)); // Parse user IDs from input
            const payload = {
                file_id: parseInt(fileId, 10),
                users,
                permission: accessType,
            };

            const response = await axios.post('/share-file', payload);
            alert(response.data.message || 'File shared successfully');
        } catch (error) {
            const errorMessage = error.response?.data?.detail || 'Error sharing file';
            alert(errorMessage);
        }
    };

    return (
        <div className="col-md-6 offset-md-3">
            <h3>Share File</h3>
            <div className="form-group">
                <label>File ID</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Enter the File ID"
                    value={fileId}
                    onChange={(e) => setFileId(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>User IDs (comma-separated)</label>
                <input
                    type="text"
                    className="form-control"
                    placeholder="Enter user IDs (e.g., 1,2,3)"
                    value={userIds}
                    onChange={(e) => setUserIds(e.target.value)}
                />
            </div>
            <div className="form-group">
                <label>Access Type</label>
                <select
                    className="form-control"
                    value={accessType}
                    onChange={(e) => setAccessType(e.target.value)}
                >
                    <option value="read">Read</option>
                    <option value="write">Write</option>
                </select>
            </div>
            <button onClick={onShareFile} className="btn btn-primary mt-3">
                Share
            </button>
        </div>
    );
};

export default FileShare;
