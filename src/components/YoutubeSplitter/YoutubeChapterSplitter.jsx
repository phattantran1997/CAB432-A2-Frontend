import React, { useState, useRef } from 'react';
import YouTube from 'react-youtube';
import axios from 'axios';
import './YoutubeChapterSplitter.css';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const YoutubeChapterSplitter = () => {
  const [videoId, setVideoId] = useState('');
  const [listOfVideoAfterTrim, setListOfVideoAfterTrim] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [selectedChapters, setSelectedChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [trimSuccess, setTrimSuccess] = useState(false);
  const playerRef = useRef(null);
  const navigate = useNavigate();
  const user = useSelector((state) => state.users);
  const userId = user ? user.user.sub : null;

  const handleVideoIdExtract = (url) => {
    const videoIdMatch = url.match(/(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
      setVideoId(videoIdMatch[1]);
      fetchVideoDetails(videoIdMatch[1]);
    } else {
      alert('Invalid YouTube URL');
    }
  };

  const fetchVideoDetails = async (id) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_BE_SIDE_URL}/youtube/video-details/${id}`);
      const description = response.data.items[0].snippet.description;
      const extractedChapters = extractChaptersFromDescription(description);
      setChapters(extractedChapters);
    } catch (error) {
      console.error('Failed to fetch video details', error);
    }
  };

  const extractChaptersFromDescription = (description) => {
    const chapterRegex = /(\d{1,2}:\d{2}(:\d{2})?)\s+(.+)/g;
    let matches;
    const chapters = [];

    while ((matches = chapterRegex.exec(description)) !== null) {
      chapters.push({
        timestamp: matches[1],
        title: matches[3],
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      });
    }

    return chapters;
  };

  const seekToTimestamp = (timestamp) => {
    const [minutes, seconds] = timestamp.split(':').map(Number);
    const timeInSeconds = minutes * 60 + (seconds || 0);
    playerRef.current.internalPlayer.seekTo(timeInSeconds);
  };

  const handleCheckboxChange = (chapter) => {
    setSelectedChapters((prevSelectedChapters) =>
      prevSelectedChapters.includes(chapter)
        ? prevSelectedChapters.filter((c) => c !== chapter)
        : [...prevSelectedChapters, chapter]
    );
  };

  const handleTrimVideos = async () => {
    setIsLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_BE_SIDE_URL}/youtube/trim-video`, {
        videoId,
        user: userId,
        chapters: selectedChapters,
      });
      if (response.status === 200) {
        setTrimSuccess(true);
        setListOfVideoAfterTrim(response.data.videoIdList);
      }
    } catch (error) {
      console.error('Error trimming videos:', error);
      alert('Failed to start trimming', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (userId, videoFileName) => {
    try {
      // Get the presigned URL from the API
      const response = await axios.get(`${import.meta.env.VITE_BE_SIDE_URL}/video/presigned-url/${userId}/${videoFileName}`);

      if (response.status === 200) {
        const presignedUrl = response.data.presignedUrl;

        // Use the presigned URL to download the video
        const videoResponse = await axios.get(presignedUrl, {
          responseType: 'blob',
        });

        const url = window.URL.createObjectURL(new Blob([videoResponse.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', videoFileName);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        throw new Error('Failed to get presigned URL');
      }
    } catch (error) {
      console.error('Error downloading video:', error);
      alert('Error downloading video:', error);
    }
  };

  const handleShare = () => {
    navigate("/post/create", { state: { videos: listOfVideoAfterTrim, videoId: videoId } });
  };

  return (
    <div className="max-w-3xl mx-auto p-4 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4">YouTube Chapter Trimmer</h2>

      <div className="flex gap-4 mb-4">
        <input
          type="text"
          placeholder="Enter YouTube URL"
          onChange={(e) => handleVideoIdExtract(e.target.value)}
          className="border p-2 rounded w-full"
        />
      </div>
      {videoId && (
        <>
          <YouTube videoId={videoId} ref={playerRef} />

          <ul className="mt-4">
            {chapters.map((chapter, index) => (
              <li
                key={index}
                className="mt-2 cursor-pointer flex items-center"
              >
                <input
                  type="checkbox"
                  onChange={() => handleCheckboxChange(chapter)}
                  className="mr-2"
                  disabled={isLoading}
                />
                <img
                  src={chapter.thumbnailUrl}
                  alt={`Thumbnail for ${chapter.title}`}
                  className="w-16 h-9 object-cover mr-4"
                  onClick={() => seekToTimestamp(chapter.timestamp)}
                />
                <div>
                  <span className="font-semibold">{chapter.timestamp}</span> -{' '}
                  <span>{chapter.title}</span>
                </div>
              </li>
            ))}
          </ul>

          {selectedChapters.length > 0 && (
            <button
              onClick={handleTrimVideos}
              className="mt-4 bg-blue-500 text-white p-2 rounded"
              disabled={isLoading}
            >
              Trim Selected Chapters
            </button>
          )}

          {isLoading && (
            <div className="mt-4 text-center">
              <p>Trimming in progress... Please wait</p>
              <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full"></div>
            </div>
          )}

          {trimSuccess && !isLoading && (
            <div className="mt-4 p-4 bg-green-100 text-green-800 rounded-md">
              <p>Trimming successful and already uploaded to S3. Download trimmed videos below:</p>
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {listOfVideoAfterTrim.map((videoMeta, index) => (
                  <div key={index} className="p-4 bg-white shadow rounded flex items-center justify-between">
                    {/* Making the videoId a clickable link that opens the s3Url in a new tab */}
                    <a href={videoMeta.s3Url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                      {videoMeta.videoId}
                    </a>
                    {/* <button
            onClick={() => handleDownload(videoMeta.userId, videoMeta.filename)}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Download
          </button> */}
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-4">
                <button
                  onClick={handleShare}
                  className="bg-blue-500 text-white p-2 rounded"
                >
                  Share on Forum
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default YoutubeChapterSplitter;
