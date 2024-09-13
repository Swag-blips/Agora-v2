import AgoraRTC from "agora-rtc-sdk-ng";

let rtc = {
  localAudioTrack: null,
  localVideoTrack: null,
  client: null,
};

let options = {
  // Pass your app ID here.
  appId: "6077c8f02a7345da98fc6d0c52b4bb8f",
  // Set the channel name.
  channel: "swag_channel",
  // Use a temp token
  token:
    "007eJxTYGg/W71NozPYSPXrAuWSaU/nytb9Umhtrpgvfr717JtfAtUKDGYG5ubJFmkGRonmxiamKYmWFmnJZikGyaZGSSZJSRZpDE2P0xoCGRlKfRYzMTJAIIjPw1Bcnpgen5yRmJeXmsPAAACpvyOn",
  // Uid
  uid: 123456,
};

rtc.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });

document.getElementById("join").onclick = async function () {
  // This would join an rtc channel

  await rtc.client.join(
    options.appId,
    options.channel,
    options.token,
    options.uid
  );

  // create a local audio  track from the audio , sampled by a microphone
  rtc.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();

  // Create a local video track from the video captured by a camera.
  rtc.localVideoTrack = await AgoraRTC.createCameraVideoTrack();

  // publish the local audio and video to the RTC channel
  await rtc.client.publish([rtc.localAudioTrack, rtc.localVideoTrack]);

  // creating a container to play the video track
  const localPlayerContainer = document.createElement("div");

  // Specify the ID of the DIV container. You can use the uid of the local user.
  localPlayerContainer.id = options.uid;
  localPlayerContainer.textContent = "Local user" + options.uid;
  localPlayerContainer.style.width = "640px";
  localPlayerContainer.style.height = "480px";
  document.body.append(localPlayerContainer);

  rtc.localVideoTrack.play(localPlayerContainer);
  console.log("publish success!");
};

// Listen for the "user-published" event, from which you can get an AgoraRTCRemoteUser object.
rtc.client.on("user-published", async (user, mediaType) => {
  await rtc.client.subscribe(user, mediaType);
  console.log("subscription was successful");

  // If the remote user publishes a video track.
  if (mediaType === "video") {
    // Get the RemoteVideoTrack object in the AgoraRTCRemoteUser object.
    const remoteVideoTrack = user.videoTrack;

    // Dynamically create a container in the form of a DIV element for playing the remote video track.
    const remotePlayerContainer = document.createElement("div");
    remotePlayerContainer.id = user.uid.toString();
    remotePlayerContainer.textContent = "Remote user " + user.uid.toString();
    remotePlayerContainer.style.width = "640px";
    remotePlayerContainer.style.height = "480px";
    document.body.append(remotePlayerContainer);

    // Play the remote video track.
    // Pass the DIV container and the SDK dynamically creates a player in the container for playing the remote video track.
    remoteVideoTrack.play(remotePlayerContainer);
  }

  if (mediaType == "audio") {
    const remoteAudioTrack = user.audioTrack;

    remoteAudioTrack.play();
  }
});

rtc.client.on("user-unpublished", (user) => {
  const remotePlayerContainer = document.getElementById(user.uid);
  remotePlayerContainer.remove();
});

document.getElementById("leave").onclick = async function () {
  rtc.localAudioTrack.close();
  rtc.localVideoTrack.close();
  rtc.client.remoteUsers.forEach((user) => {
    const playerContainer = document.getElementById(user.uid);
    playerContainer.remove();
  });
};
