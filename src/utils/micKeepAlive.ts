let keepAliveStream: MediaStream | null = null;
let keepAliveTrack: MediaStreamTrack | null = null;

export const startKeepAliveMic = async () => {
  if (keepAliveTrack && keepAliveTrack.readyState === "live") return;

  keepAliveStream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: false,
  });

  keepAliveTrack = keepAliveStream.getAudioTracks()[0] || null;

  // keep enabled so the browser mic icon stays ON
  if (keepAliveTrack) keepAliveTrack.enabled = true;

  console.log("✅ keepAlive mic started");
};

export const stopKeepAliveMic = () => {
  try { keepAliveTrack?.stop(); } catch {}
  keepAliveTrack = null;
  keepAliveStream = null;
  console.log("✅ keepAlive mic stopped");
};

export const isKeepAliveMicOn = () =>
  !!keepAliveTrack && keepAliveTrack.readyState === "live";
