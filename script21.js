// Initialize Three.js scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);

// Particle System for Sphere
const particleCount = 10000; // Adjust for performance and appearance
const particles = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    const theta = 2 * Math.PI * Math.random();
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 1; // Radius of the sphere

    const x = r * Math.sin(phi) * Math.cos(theta);
    const y = r * Math.sin(phi) * Math.sin(theta);
    const z = r * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
}

particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));

// Particle Material with Glow Effect
const particleMaterial = new THREE.PointsMaterial({
    color: 0x00ffff,
    size: 0.02,
    blending: THREE.AdditiveBlending,
    transparent: true
});

const particleSystem = new THREE.Points(particles, particleMaterial);
scene.add(particleSystem);

// Glowing Rings
const ringMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.4
});

const ring1 = new THREE.RingGeometry(1.1, 1.15, 64);
const ring2 = new THREE.RingGeometry(1.2, 1.25, 64);
const ringMesh1 = new THREE.Mesh(ring1, ringMaterial);
const ringMesh2 = new THREE.Mesh(ring2, ringMaterial);
ringMesh1.rotation.x = Math.PI / 2;
ringMesh2.rotation.x = Math.PI / 2;
scene.add(ringMesh1);
scene.add(ringMesh2);

// Glowing Center (Shining Sun Effect)
const glowMaterial = new THREE.ShaderMaterial({
    uniforms: {
        glowColor: { type: "c", value: new THREE.Color(0xffaa00) },
        viewVector: { type: "v3", value: camera.position }
    },
    vertexShader: `
        uniform vec3 viewVector;
        varying float intensity;
        void main() {
            vec3 vNormal = normalize( normalMatrix * normal );
            vec3 vNormel = normalize( normalMatrix * viewVector );
            intensity = pow( dot(vNormal, vNormel), 2.0 );
            gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
        }
    `,
    fragmentShader: `
        uniform vec3 glowColor;
        varying float intensity;
        void main() {
            vec3 glow = glowColor * intensity;
            gl_FragColor = vec4( glow, 1.0 );
        }
    `,
    side: THREE.FrontSide,
    blending: THREE.AdditiveBlending,
    transparent: true
});

const glowGeometry = new THREE.CircleGeometry(0.3, 32); // Adjust size for the central glow effect
const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
glowMesh.position.set(0, 0, 0); // Center position
scene.add(glowMesh);

// Camera and Animation
camera.position.z = 3;

function animate() {
    requestAnimationFrame(animate);
    // Rotate the particles and rings for a dynamic effect
    particleSystem.rotation.y += 0.002;
    ringMesh1.rotation.z -= 0.005;
    ringMesh2.rotation.z += 0.004;

    // Make the glowing circle pulsate slightly
    glowMesh.scale.set(1 + 0.1 * Math.sin(Date.now() * 0.005), 1 + 0.1 * Math.sin(Date.now() * 0.005), 1);

    renderer.render(scene, camera);
}

animate();

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});

// Speech Recognition Initialization
let recognition;
let isSpeaking = false;
let isMusicPlaying = false;
let currentTrack = 0;
const tracks = ['track1.mp3', 'track2.mp3', 'track3.mp3']; // Add your music tracks here
const apiKey = 'AIzaSyB1seGuX9aaYHXVHvQf1NKk9d0T4Tpx36k'; // Replace with your YouTube Data API key
const weatherApiKey = '9b72R0rSgsjhwvrFZ0fLlUxHN9nAUTss'; // Replace with your Tomorrow API key

function initRecognition() {
    recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'hi-IN'; // Set language to Hindi
    recognition.continuous = false; // Disable continuous listening
    recognition.interimResults = false; // Only get final results

    recognition.onstart = function() {
        console.log("Voice recognition started. Listening...");
    };

    recognition.onresult = function(event) {
        const transcript = event.results[0][0].transcript;
        console.log("Voice input: ", transcript);
        displayConversation('user', transcript); // Show the user’s input
        handleVoiceInput(transcript); // Process the voice input
    };

    recognition.onend = function() {
        if (!isSpeaking) {
            console.log("Voice recognition ended. Ready to restart.");
        }
    };

    recognition.onerror = function(event) {
        console.error("Error occurred in recognition: " + event.error);
        if (event.error === 'no-speech' || event.error === 'network') {
            recognition.start(); // Restart on specific errors
        }
    };
}

// Function to handle the voice input and generate a response
async function handleVoiceInput(userInput) {
    let response = '';

    if (userInput.includes('वीडियो')) {
        response = "यूट्यूब पर वीडियो खोज रहा हूँ...";
        await playFirstYouTubeVideo(userInput); // Search and play the first video
    } else if (userInput.includes('पॉज़') || userInput.includes('रुको')) {
        response = "गाना पॉज़ कर रहा हूँ...";
        pauseMusic(); // Pause music
    } else if (userInput.includes('अगला गाना')) {
        response = "अगला गाना बजा रहा हूँ...";
        nextTrack(); // Play next track
    } else if (userInput.includes('समय')) {
        response = getCurrentTime(); // Get current time
    } else if (userInput.includes('तारीख')) {
        response = getCurrentDate(); // Get current date
    } else if (userInput.includes('मौसम')) {
        response = await getWeather(); // Get weather info from an API
    } else if (userInput.includes('मजेदार')) {
        response = "मजेदार? मैं हमेशा मजेदार हूँ! 😄";
    } else if (userInput.includes('खेल')) {
        response = "खेल? वर्चुअल गेम्स का आनंद लें!";
    } else if (userInput.includes('प्यार')) {
        response = "प्यार? हमेशा आपके साथ हूँ!";
    } else {
        response = "मुझे खेद है, मैं इस पर मदद नहीं कर सकता। कृपया कुछ और पूछें!";
    }

    displayConversation('assistant', response); // Show the assistant’s response on screen
    speakHindi(response); // Speak the response
}

// Function to search and play the first YouTube video based on a query
async function playFirstYouTubeVideo(query) {
    const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&key=${apiKey}&maxResults=1&type=video`;

    try {
        const response = await fetch(searchUrl);
        if (!response.ok) {
            throw new Error('Failed to fetch search results from YouTube.');
        }
        const data = await response.json();
        if (data.items.length === 0) {
            throw new Error('No videos found.');
        }
        const videoId = data.items[0].id.videoId;

        // Fetch video details to check embedding permissions
        const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails,status&id=${videoId}&key=${apiKey}`;
        const videoDetailsResponse = await fetch(videoDetailsUrl);
        if (!videoDetailsResponse.ok) {
            throw new Error('Failed to fetch video details.');
        }
        const videoDetails = await videoDetailsResponse.json();
        if (videoDetails.items.length === 0) {
            throw new Error('No video details found.');
        }
        const embeddable = videoDetails.items[0].status.embeddable;

        console.log(`Video embeddable status: ${embeddable}`);

        if (embeddable) {
            // If the video is embeddable, play it in the embedded player
            pendingVideoUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
            const player = document.getElementById("youtube-player");
            if (player) {
                player.src = pendingVideoUrl; // Set the source of the YouTube player
                console.log("Playing video in embedded player.");
            } else {
                console.error("YouTube player element not found.");
            }
        } else {
            // If the video can't be embedded, redirect to YouTube video page
            const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
            console.log(`Redirecting to YouTube: ${youtubeUrl}`);

            setTimeout(() => {
                window.open(youtubeUrl, '_blank'); // Open YouTube video in a new tab
            }, 200); // Small delay to allow the user action to trigger the pop-up
        }

        // Scroll to the YouTube player automatically
        const conversationDiv = document.getElementById("conversation");
        if (conversationDiv) {
            conversationDiv.scrollTop = conversationDiv.scrollHeight;
        } else {
            console.error("Conversation element not found.");
        }

    } catch (error) {
        console.error("YouTube API Error: ", error);
        displayConversation('assistant', "यूट्यूब वीडियो नहीं खेल सकता।");
    }
}

// Function to display the conversation in the same place
function displayConversation(sender, message) {
    const conversationDiv = document.getElementById("conversation");
    const messageElement = document.createElement("p");

    if (sender === 'user') {
        messageElement.className = 'user';
    } else {
        messageElement.className = 'assistant';
    }

    messageElement.innerHTML = message; // Use innerHTML to support rich text
    conversationDiv.appendChild(messageElement);

    // Scroll to the bottom of the conversation
    conversationDiv.scrollTop = conversationDiv.scrollHeight;
}

// Function to stop listening
function stopListening() {
    recognition.stop(); // Stop the speech recognition
    isSpeaking = true; // Set speaking flag to true
}

// Function to speak the response in Hindi
function speakHindi(text) {
    const speech = new SpeechSynthesisUtterance();
    speech.lang = 'hi-IN'; // Hindi language
    speech.text = text;

    speech.onstart = function() {
        isSpeaking = true; // Set flag to true when speech starts
    };

    speech.onend = function() {
        console.log("Speaking finished. Resuming listening...");
        isSpeaking = false; // Reset speaking flag after speaking
        startListening(); // Restart listening after speaking is done
    };

    setTimeout(function() {
        window.speechSynthesis.speak(speech);
    }, 200); // 200 milliseconds delay
}

// Function to start listening
function startListening() {
    if (!isSpeaking) {
        recognition.start(); // Start listening when it's ready
    }
}

// Function to get current time
function getCurrentTime() {
    const now = new Date();
    return `अभी समय है: ${now.getHours()}:${now.getMinutes()}`;
}

// Function to get current date
function getCurrentDate() {
    const now = new Date();
    return `आज की तारीख है: ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
}

// Function to get weather info (using Tomorrow API)
async function getWeather() {
    const location = 'MUMBAI'; // Change to your desired location
    const url = `https://api.tomorrow.io/v4/weather/realtime?location=${location}&apikey=${weatherApiKey}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
        const data = await response.json();
        const temperature = data.data.values.temperature;
        const condition = data.data.values.weatherCode;
        return `आज का मौसम ${temperature}°C है। ${condition}`;
    } catch (error) {
        console.error("Weather API Error: ", error);
        return "मौसम की जानकारी प्राप्त नहीं कर पा रहा हूँ।";
    }
}

// Function to play music
function playMusic() {
    const player = document.getElementById("music-player");
    player.src = tracks[currentTrack]; // Set the current track
    player.play();
    isMusicPlaying = true;
}

// Function to pause music
function pauseMusic() {
    const player = document.getElementById("music-player");
    player.pause();
    isMusicPlaying = false;
}

// Function to play the next track
function nextTrack() {
    currentTrack = (currentTrack + 1) % tracks.length; // Loop to next track
    playMusic(); // Play the next track
}

// Initialize the assistant
document.getElementById("start-listening").addEventListener("click", () => {
    initRecognition(); // Initialize speech recognition
    startListening(); // Start listening on button click
});

// Play/Pause button functionality
document.getElementById("play-btn").addEventListener("click", function() {
    const audioPlayer = document.getElementById("music-player");
    const playButton = this;

    if (audioPlayer.paused) {
        audioPlayer.play();
        playButton.innerHTML = '&#10074;&#10074;'; // Pause Icon
    } else {
        audioPlayer.pause();
        playButton.innerHTML = '&#9658;'; // Play Icon
    }
});

// Next and Previous track buttons
document.getElementById("next-btn").addEventListener("click", nextTrack);
document.getElementById("prev-btn").addEventListener("click", function() {
    currentTrack = (currentTrack - 1 + tracks.length) % tracks.length; // Loop to previous track
    playMusic(); // Play the previous track
});
