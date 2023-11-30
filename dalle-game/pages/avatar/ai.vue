<template>

</template>

<script setup lang="ts">
import * as SpeechSDK from "microsoft-cognitiveservices-speech-sdk";

const config = useRuntimeConfig()
const speechKey = config.public.speechApiKey as string;
const speechRegion = config.public.speechRegion as string;

// テキスト読み上げ言語と音声変換を選択する
const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(speechKey,speechRegion);
// Set either the `SpeechSynthesisVoiceName` or `SpeechSynthesisLanguage`.
speechConfig.speechSynthesisLanguage = "en-US"; //ja-JP
speechConfig.speechSynthesisVoiceName = "en-US-JennyNeural"; //ja-JP-NanamiNeural

// アバターのキャラクターとスタイルを選択する
//(リアルタイム API では casual-sitting スタイルのみサポートされています)
const avatarConfig = new SpeechSDK.AvatarConfig(
    "lisa", // Set avatar character here.
    "casual-sitting", // Set avatar style here.
);

// リアルタイム アバターへの接続を設定する
// Create WebRTC peer connection
const iceServerURL = config.public.iceServerUrl as string;
const username = config.public.iceServerUsername as string;
const credential = config.public.iceServerCredential as string;

console.log(`iceServerURL: ${iceServerURL}, username: ${username}, credential: ${credential}`);

const peerConnection = new RTCPeerConnection({
    iceServers: [{
        urls: [ iceServerURL ],
        username: username,
        credential: credential
    }]
})
console.log("Created peer connection object");
console.log(peerConnection);
</script>