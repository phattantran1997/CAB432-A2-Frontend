import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './VideoTranscoding.css';
import { useSelector } from "react-redux";

const VideoTranscoding = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [transcoding, setTranscoding] = useState(false);
  const [cancelProgress, setCancelProgress] = useState(false);
  const [transcodingOption, setTranscodingOption] = useState('3840x2160-libx264');
  const [progress, setProgress] = useState(0);
  const [transcodedVideoPath, setTranscodedVideoPath] = useState(null);
  const [transcodingJobId, setTranscodingJobId] = useState(localStorage.getItem('transcodingJobId') || null);
  const [serverError, setServerError] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(''); // New state for connection status
  const [serverAliveMessage, setServerAliveMessage] = useState(''); // New state for reconnection message

  const user = useSelector((state) => state.users); // Get the user data from Redux
  const userId = user ? user.user.sub : null; // Extract userId (sub) from user token

  let eventSource = null;
  let retryInterval = null; // To store the retry interval reference

  useEffect(() => {
    if (transcodingJobId) {
      createEventSource();
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
      clearRetryInterval(); // Clear the retry interval when component unmounts
    };
  }, [transcodingJobId]);

  // Function to create an EventSource connection
  const createEventSource = () => {
    if (eventSource) {
      eventSource.close();
    }

    if (!transcodingJobId) return;

    eventSource = new EventSource(`${import.meta.env.VITE_BE_SIDE_URL}/video/progress?jobId=${transcodingJobId}`);
    setServerError(false);
    setProgress(0);
    setConnectionStatus('Connected'); // Initially, connection is established

    eventSource.onmessage = handleProgressEvent;
    eventSource.onerror = handleEventSourceError; // Handles error for connection loss
    eventSource.onopen = handleEventSourceOpen; // Handles reconnection
  };

  // Function to handle progress events
  const handleProgressEvent = (event) => {
    const progressData = JSON.parse(event.data);
    if (progressData.done) {
      updateUploadStatus('Transcoding completed!', 100);
      localStorage.removeItem('transcodingJobId');
      setTranscoding(false);
      eventSource.close();
    } else if (progressData.error) {
      updateUploadStatus('Error during transcoding', progressData.percent);
      setServerError(true);
      setTranscoding(false);
      eventSource.close();
      checkServerAndDeleteVideo(); // Call once when an error occurs
    } else {
      updateUploadStatus(`Processing: ${Math.round(progressData.percent)}% done`, progressData.percent);
      setTranscoding(true);
    }
  };

  // Function to handle event source errors and retry connection
  const handleEventSourceError = () => {
    setServerError(true);
    setTranscoding(false);
    setConnectionStatus('Connection lost. Reconnecting...'); // Inform user connection is lost
    eventSource.close();

    // Retry connection every 5 seconds
    retryInterval = setInterval(async () => {
      try {
        // Check if server is alive
        const response = await axios.get(`${import.meta.env.VITE_BE_SIDE_URL}/video/health-check`);
        if (response.status === 200) {
          console.log('Server is alive again.');
          setServerError(false);
          setServerAliveMessage('Server is live again! Reconnecting...');
          createEventSource(); // Re-establish the connection
          clearRetryInterval(); // Stop retrying once connected
          if (transcodingJobId) {
            const fileName = `${transcodingJobId}.mp4`;
            await deleteVideoFile(fileName);
          }
        }
      } catch (error) {
        console.error('Retry failed. Server is still down:', error);
      }
    }, 5000);
  };

  const deleteVideoFile = async (fileName) => {
    try {
      const response = await axios.delete(`${import.meta.env.VITE_BE_SIDE_URL}/video/${fileName}`);
      if (response.status === 200) {
        console.log('File successfully deleted');
      } else {
        console.error('Failed to delete file:', response.data.message);
      }
    } catch (error) {
      console.error('Error deleting video file:', error.response?.data?.message || error.message);
    }
  };


  // Function to handle when connection is re-established
  const handleEventSourceOpen = () => {
    setConnectionStatus('Connected');
    setServerAliveMessage(''); // Clear any existing server live message
  };

  // Function to clear the retry interval
  const clearRetryInterval = () => {
    if (retryInterval) {
      clearInterval(retryInterval);
      retryInterval = null;
    }
  };

  // Function to update upload status and progress
  const updateUploadStatus = (status, percent) => {
    setUploadStatus(status);
    setProgress(Math.round(percent));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      resetState();
    }
  };

  // Reset state function
  const resetState = () => {
    setUploadStatus('');
    setErrorMessage('');
    setTranscodedVideoPath(null);
    setProgress(0);
  };

  const handleOptionChange = (event) => {
    setTranscodingOption(event.target.value);
  };

  const handleTranscode = async () => {
    setCancelProgress(true);
    if (!selectedFile) {
      setErrorMessage('Please select a video file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('video', selectedFile);
    formData.append('transcodingOption', transcodingOption);
    formData.append('userId', userId);

    try {
      setTranscoding(true);
      updateUploadStatus('Uploading and transcoding video...', 0);

      const response = await axios.post(`${import.meta.env.VITE_BE_SIDE_URL}/video/transcoding`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const jobId = response.data.transcodingJobId;

      // Store transcodingJobId in localStorage and state
      localStorage.setItem('transcodingJobId', jobId);
      setTranscodingJobId(jobId);
      updateUploadStatus('Transcoding started...', 0);
      setErrorMessage('');

      createEventSource(); // Start tracking progress
    } catch (error) {
      updateUploadStatus('');
      setErrorMessage('Error uploading video: ' + (error.response?.data?.message || error.message));
    } finally {
      setTranscoding(false);
    }
  };

  const handleCancel = async () => {
    if (!transcodingJobId) {
      setErrorMessage('No active transcoding job to cancel.');
      return;
    }

    try {
      const response = await axios.delete(`${import.meta.env.VITE_BE_SIDE_URL}/video/cancel-transcoding`, {
        data: { transcodingJobId },
      });

      setUploadStatus(response.data.message);
      setTranscodingJobId(null);
      localStorage.removeItem('transcodingJobId');
      setProgress(0);
      setCancelProgress(false);
      setTranscoding(false);
    } catch (error) {
      setErrorMessage('Error canceling transcoding: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="video-upload-container">
      <h2 className="title">Upload Your Video</h2>
      <input onChange={handleFileChange} type="file" className="file-input" accept="video/*" />

      <select onChange={handleOptionChange} value={transcodingOption} className="transcoding-option">
        <option value="3840x2160-libx264">4K - 3840x2160 - libx264 (MP4)</option>
        <option value="3840x2160-libvpx">4K - 3840x2160 - libvpx (WebM)</option>
        <option value="1920x1080-libx264">1080p - 1920x1080 - libx264 (MP4)</option>
        <option value="1920x1080-libvpx">1080p - 1920x1080 - libvpx (WebM)</option>
        <option value="1280x720-libx264">720p - 1280x720 - libx264 (MP4)</option>
      </select>

      <button onClick={handleTranscode} className="upload-button" disabled={transcoding}>
        {transcoding ? 'Transcoding...' : 'Transcode'}
      </button>

      {cancelProgress && (
        <button onClick={handleCancel} className="cancel-button">
          Cancel Transcoding
        </button>
      )}
      {progress > 0 && (
        <div className="progress-bar">
          <div className="progress" style={{ width: `${progress}%` }}>
            {progress}%
          </div>
        </div>
      )}

      {uploadStatus && <p className="success-message">{uploadStatus}</p>}
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      {serverError && <p className="error-message">Server error occurred. Attempting to reconnect...</p>}
      {connectionStatus && <p className="connection-status">{connectionStatus}</p>} {/* Show connection status */}
      {serverAliveMessage && <p className="success-message">{serverAliveMessage}</p>} {/* Show server live message */}
      {transcodedVideoPath && (
        <div className="transcoded-video-container">
          <h3 className="transcoded-video-title">
            Transcoded Video: <span className="video-path">{transcodedVideoPath}</span>
          </h3>
        </div>
      )}
    </div>
  );
};

export default VideoTranscoding;
