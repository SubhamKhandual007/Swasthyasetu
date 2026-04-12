import React, { useEffect, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VideoConsultation = () => {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [roomHash, setRoomHash] = useState('');
  const [isJoined, setIsJoined] = useState(false);
  
  // ScaleDrone and WebRTC references
  const droneRef = useRef(null);
  const pcRef = useRef(null);
  const roomRef = useRef(null);

  const configuration = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  useEffect(() => {
    // Generate or use existing hash
    let hash = window.location.hash.substring(1);
    if (!hash) {
      hash = Math.floor(Math.random() * 0xFFFFFF).toString(16);
      window.location.hash = hash;
    }
    setRoomHash(hash);

    // Dynamically load ScaleDrone script
    const script = document.createElement('script');
    script.src = 'https://cdn.scaledrone.com/scaledrone.min.js';
    script.async = true;
    script.onload = () => {
        initializeScaleDrone(hash);
    };
    document.body.appendChild(script);

    return () => {
      if (droneRef.current) droneRef.current.close();
      if (pcRef.current) pcRef.current.close();
      document.body.removeChild(script);
    };
  }, []);

  const initializeScaleDrone = (hash) => {
    const drone = new window.ScaleDrone('yiS12Ts5RdNhebyM');
    droneRef.current = drone;
    const roomName = 'observable-' + hash;

    drone.on('open', error => {
      if (error) return console.error(error);
      
      const room = drone.subscribe(roomName);
      roomRef.current = room;

      room.on('open', error => {
        if (error) console.error(error);
      });

      room.on('members', members => {
        console.log('MEMBERS', members);
        const isOfferer = members.length === 2;
        startWebRTC(isOfferer, roomName);
        setIsJoined(true);
      });
    });
  };

  const sendMessage = (message, roomName) => {
    droneRef.current.publish({ room: roomName, message });
  };

  const startWebRTC = (isOfferer, roomName) => {
    const pc = new RTCPeerConnection(configuration);
    pcRef.current = pc;

    pc.onicecandidate = event => {
      if (event.candidate) {
        sendMessage({ 'candidate': event.candidate }, roomName);
      }
    };

    if (isOfferer) {
      pc.onnegotiationneeded = () => {
        pc.createOffer().then(desc => localDescCreated(desc, roomName)).catch(err => console.error(err));
      }
    }

    pc.ontrack = event => {
      const stream = event.streams[0];
      if (remoteVideoRef.current && (!remoteVideoRef.current.srcObject || remoteVideoRef.current.srcObject.id !== stream.id)) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    navigator.mediaDevices.getUserMedia({ audio: true, video: true })
      .then(stream => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
        stream.getTracks().forEach(track => pc.addTrack(track, stream));
      })
      .catch(err => {
        console.error(err);
        toast.error("Could not access camera/microphone. Please check permissions!");
      });

    roomRef.current.on('data', (message, client) => {
      if (client.id === droneRef.current.clientId) return;

      if (message.sdp) {
        pc.setRemoteDescription(new RTCSessionDescription(message.sdp), () => {
          if (pc.remoteDescription.type === 'offer') {
            pc.createAnswer().then(desc => localDescCreated(desc, roomName)).catch(err => console.error(err));
          }
        }, err => console.error(err));
      } else if (message.candidate) {
        pc.addIceCandidate(new RTCIceCandidate(message.candidate), () => {}, err => console.error(err));
      }
    });
  };

  const localDescCreated = (desc, roomName) => {
    pcRef.current.setLocalDescription(desc, () => {
      sendMessage({ 'sdp': pcRef.current.localDescription }, roomName);
    }, err => console.error(err));
  };

  return (
    <div style={containerStyle}>
      <div style={copyStyle}>
        Room ID: <strong>{roomHash}</strong> | {isJoined ? "✅ Connected" : "⏳ Waiting for partner..."}
      </div>
      
      <video 
        ref={remoteVideoRef} 
        id="remoteVideo" 
        autoPlay 
        playsInline
        style={remoteVideoStyle}
      />
      
      <video 
        ref={localVideoRef} 
        id="localVideo" 
        autoPlay 
        muted 
        playsInline
        style={localVideoStyle}
      />

      <div style={controlsStyle}>
          <button 
            onClick={() => window.location.reload()} 
            style={buttonStyle}
          >
              End Call
          </button>
      </div>

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
};

// Styles based on user provided CSS
const containerStyle = {
  display: 'flex',
  height: '100vh',
  width: '100vw',
  margin: 0,
  backgroundColor: '#000',
  fontFamily: '-apple-system, BlinkMacSystemFont, sans-serif',
  position: 'relative',
  padding: 0,
  overflow: 'hidden'
};

const remoteVideoStyle = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  backgroundColor: '#1a1a1a'
};

const localVideoStyle = {
  position: 'absolute',
  bottom: '20px',
  right: '20px',
  width: '200px',
  height: '150px',
  borderRadius: '12px',
  backgroundColor: '#222',
  objectFit: 'cover',
  border: '2px solid rgba(255, 255, 255, 0.4)',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5)',
  zIndex: 10
};

const copyStyle = {
  position: 'fixed',
  top: '20px',
  left: '50%',
  transform: 'translateX(-50%)',
  fontSize: '14px',
  color: '#fff',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(10px)',
  padding: '8px 16px',
  borderRadius: '20px',
  zIndex: 20,
  border: '1px solid rgba(255, 255, 255, 0.1)'
};

const controlsStyle = {
    position: 'fixed',
    bottom: '30px',
    left: '50%',
    transform: 'translateX(-50%)',
    zIndex: 20
};

const buttonStyle = {
    backgroundColor: '#e74c3c',
    color: 'white',
    border: 'none',
    padding: '12px 24px',
    borderRadius: '30px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(231, 76, 60, 0.3)'
};

export default VideoConsultation;
