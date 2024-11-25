import React, { useRef, useState } from "react";
import { socket } from "@/utils/socket";

function index() {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [peerConnection, setPeerConnection] = useState(null);

  // STUN Server Configuration
  const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  // Initialize WebRTC and Join
  const startCall = async () => {
    try {
      const connection = new RTCPeerConnection(config);
      setPeerConnection(connection);

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      localVideoRef.current.srcObject = stream;
      stream.getTracks().forEach((track) => connection.addTrack(track, stream));

      connection.onicecandidate = (event) => {
        if (event.candidate) {
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            targetUserId,
          });
        }
      };

      connection.ontrack = (event) => {
        remoteVideoRef.current.srcObject = event.streams[0];
      };

      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);

      socket.emit("call-user", { offer, targetUserId });
    } catch (error) {
      console.error("Error during startCall:", error);
    }
  };

  // Handle Incoming Call
  socket.on("call-offer", async ({ offer, callerId }) => {
    const connection = new RTCPeerConnection(config);
    setPeerConnection(connection);

    // Handle Local Stream
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideoRef.current.srcObject = stream;
    stream.getTracks().forEach((track) => connection.addTrack(track, stream));

    // Handle ICE Candidates
    connection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          targetUserId: callerId,
        });
      }
    };

    // Handle Remote Stream
    connection.ontrack = (event) => {
      remoteVideoRef.current.srcObject = event.streams[0];
    };

    // Set Remote Description and Create Answer
    await connection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await connection.createAnswer();
    await connection.setLocalDescription(answer);
    socket.emit("answer-call", { answer, callerId });
  });

  return (
    <div>
      <video ref={localVideoRef} autoPlay muted playsInline></video>
      <video ref={remoteVideoRef} autoPlay playsInline></video>
      <button onClick={startCall}>Start Call</button>
    </div>
  );
}

export default index;
