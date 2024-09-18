const scene = new THREE.Scene();72
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
document.addEventListener('DOMContentLoaded', () => {
    speakOnLoad();
});

document.getElementById('start-btn').addEventListener('click', () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        document.getElementById('response').textContent = 'इस ब्राउज़र में स्पीच रिकग्निशन सपोर्ट नहीं है।';
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN'; // Set language to Hindi

    recognition.onstart = () => {
        document.getElementById('response').textContent = 'सुन रहा हूँ...';
    };

    recognition.onspeechend = () => {
        document.getElementById('response').textContent = 'सुनना बंद कर दिया।';
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        
        if (transcript.includes('jarvis')) {
            const responses = [
                'मेरा नाम Jarvis है, मैं आपका व्यक्तिगत AI सहायक हूँ। मुझे RK और इशिता ने बनाया है।',
                'नमस्ते! आज आपकी किस तरह की मदद कर सकता हूँ?',
                'अरे! क्या आप भी मेरे साथ बात करके खुश हैं?',
                'आपको पता है, मैं खुद को बहुत स्मार्ट मानता हूँ। क्या आप भी ऐसा मानते हैं?'
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            document.getElementById('response').textContent = randomResponse;
            speakOut(randomResponse); // Speak the response
        } else if (transcript.includes('खोज') || transcript.includes('जानकारी')) {
            const query = transcript.replace(/खोज|जानकारी/, '').trim();
            if (query) {
                displaySearchResults(query);
            } else {
                const noQueryResponse = 'आपने क्या खोजना है?';
                document.getElementById('response').textContent = noQueryResponse;
                speakOut(noQueryResponse); // Speak the response
            }
        } else if (transcript.includes('sir mein dard') || transcript.includes('bukhar') || transcript.includes('sardi')) {
            provideMedicalSuggestions(transcript);
        } else {
            const noJarvisResponse = 'क्या आपने Jarvis को बुलाया?';
            document.getElementById('response').textContent = noJarvisResponse;
            speakOut(noJarvisResponse); // Speak the response
        }
    };

    recognition.start();
});

function displaySearchResults(query) {
    const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(searchUrl, '_blank');
    const searchResponse = `मैंने '${query}' के लिए खोज परिणाम नए टैब में खोल दिए हैं।`;
    document.getElementById('response').textContent = searchResponse;
    speakOut(searchResponse); // Speak the response
}

function provideMedicalSuggestions(transcript) {
    let suggestion = '';
    let imageUrl = '';
    if (transcript.includes('sir mein dard')) {
        suggestion = 'सरदर्द के लिए, आप निम्न दवाएँ ले सकते हैं:';
        imageUrl = 'path-to-headache-medicine-image.jpg'; // Replace with the actual path
        suggestion += '<ul><li>पैरासिटामोल</li><li>इबुप्रोफेन</li></ul>';
    } else if (transcript.includes('bukhar')) {
        suggestion = 'बुखार के लिए, आप निम्न दवाएँ ले सकते हैं:';
        imageUrl = 'path-to-fever-medicine-image.jpg'; // Replace with the actual path
        suggestion += '<ul><li>पैरासिटामोल</li></ul>';
    } else if (transcript.includes('sardi')) {
        suggestion = 'सर्दी के लिए, आप निम्न दवाएँ ले सकते हैं:';
        imageUrl = 'path-to-cold-medicine-image.jpg'; // Replace with the actual path
        suggestion += '<ul><li>सर्दी-खाँसी की दवाई</li><li>शहद-गर्म पानी</li></ul>';
    }

    document.getElementById('response').innerHTML = `
        <div id="info">
            <img src="${imageUrl}" alt="Medicine Image" id="info-image">
            <p>${suggestion}</p>
        </div>
    `;
    speakOut(suggestion); // Speak the response
}

async function speakOnLoad() {
    const weatherInfo = await getWeatherInfo();
    const detailedWeatherMessage = `.......................................................................................................................................................नमस्ते! मैं Jarvis हूँ, आपका व्यक्तिगत AI सहायक। ${weatherInfo} अब मैं आपके लिए संगीत चला रहा हूँ।`;
    displayWeatherInfo(weatherInfo);
    speakOut(detailedWeatherMessage);
}
async function getWeatherInfo() {
    // Replace with your API key and endpoint
    const apiKey = '9b72R0rSgsjhwvrFZ0fLlUxHN9nAUTss';
    const city = 'mumbai';
    const url = `https://api.tomorrow.io/v4/timelines?location=${city}&fields=temperature&apikey=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        const temperature = data.data.timelines[0].intervals[0].values.temperature;
        return `आज का तापमान ${temperature} डिग्री सेल्सियस है`;
    } catch (error) {
        console.error('Weather API Error:', error);
        return 'मौसम की जानकारी प्राप्त नहीं कर सका';
    }
}

function displayWeatherInfo(weatherInfo) {
    const weatherDiv = document.createElement('div');
    weatherDiv.id = 'weather-info';

    // You can replace the icon based on the weather condition
    const weatherIconUrl = 'we.JPG'; // Replace with the actual path to your weather icon

    weatherDiv.innerHTML = `
        <img src="${weatherIconUrl}" alt="Weather Icon">
        <p>${weatherInfo}</p>
    `;
    document.body.appendChild(weatherDiv);
}

function speakOut(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'hi-IN'; // Set language to Hindi
    window.speechSynthesis.speak(speech);
}
function speakOut(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN'; // Set language to Hindi
    window.speechSynthesis.speak(utterance);
}
const audioPlayer = document.getElementById('music-player');
const playButton = document.getElementById('play-btn');
const trackTitle = document.getElementById('track-title');

// Array of songs (URLs) and their corresponding titles and album covers
const songs = [
    { 
        url: 'Ganga-Dharay-Shiv-Ganga-Dharay.mp3', // Replace with a valid music URL
        title: 'SHIV BEATS',
        cover: 'shiv.JPEG' // Replace with a valid album cover URL
    },
    { 
        url: 'Tu Aayi Nai_320(PagalWorld.com.so).mp3', 
        title: 'Aayi Nai',
        cover: 'kai.JPG' // Replace with another valid album cover URL
    }
];

let currentTrackIndex = 0;

// Load the first track
function loadTrack(index) {
    audioPlayer.src = songs[index].url;
    trackTitle.textContent = 'Now Playing: ' + songs[index].title;
    document.querySelector('.album-cover').src = songs[index].cover;
    playButton.innerHTML = '&#9658;'; // Reset to play icon
}

// Toggle Play/Pause Function
function togglePlay() {
    if (audioPlayer.paused) {
        audioPlayer.play();
        playButton.innerHTML = '&#10074;&#10074;'; // Pause Icon
    } else {
        audioPlayer.pause();
        playButton.innerHTML = '&#9658;'; // Play Icon
    }
}

// Play the next track
function playNext() {
    currentTrackIndex = (currentTrackIndex + 1) % songs.length;
    loadTrack(currentTrackIndex);
    audioPlayer.play();
    playButton.innerHTML = '&#10074;&#10074;'; // Pause Icon
}

// Play the previous track
function playPrevious() {
    currentTrackIndex = (currentTrackIndex - 1 + songs.length) % songs.length;
    loadTrack(currentTrackIndex);
    audioPlayer.play();
    playButton.innerHTML = '&#10074;&#10074;'; // Pause Icon
}

// Initialize the audio player when the page loads
window.onload = function () {
    loadTrack(currentTrackIndex);
};
document.addEventListener('DOMContentLoaded', () => {
    const userInput = document.getElementById('user-input');
    const responseDiv = document.getElementById('response');
    const audioPlayer = document.getElementById('music-player');
    const playButton = document.getElementById('play-btn');

    // Event listener for the Enter key
    userInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleUserInput(); // Call function to handle user input
        }
    });

    // Function to handle user input and generate a response
    function handleUserInput() {
        const userText = userInput.value.trim(); // Get the input text
        if (userText) {
            generateResponse(userText); // Generate a response for the input
            userInput.value = ''; // Clear the input field after processing
        }
    }

    // Function to generate a response based on user input
    function generateResponse(text) {
        let responseText = '';

        // Simple responses for specific keywords or phrases
        if (text.toLowerCase().includes('weather')) {
            responseText = "आज का मौसम धूप वाला है, तापमान 25 डिग्री सेल्सियस है।";
        } else if (text.toLowerCase().includes('music')) {
            responseText = "आपके लिए संगीत बजा रहा हूँ।";
            playMusic(); // Play music automatically
        } else if (text.toLowerCase().includes('jarvis')) {
            responseText = "नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?";
        } else if (text.toLowerCase().includes('your name')) {
            responseText = "मेरा नाम Jarvis है, मैं आपका व्यक्तिगत AI सहायक हूँ, जिसे RK और इशिता ने बनाया है।";
        } else if (text.toLowerCase().includes('headache')) {
            responseText = "सर दर्द के लिए आप पेरासिटामोल या इबुप्रोफेन ले सकते हैं।";
        } else {
            // Default response for unrecognized input
            responseText = "मुझे समझ नहीं आ रहा कि मैं आपकी कैसे मदद करूँ, लेकिन मैं सीखने के लिए यहाँ हूँ!";
        }

        displayResponse(responseText); // Display the response
        speak(responseText); // Make Jarvis speak the response
    }

    // Function to display the response on the page
    function displayResponse(response) {
        responseDiv.textContent = response;
    }

    // Function to make Jarvis speak in Hindi
    function speak(text) {
        const speech = new SpeechSynthesisUtterance(text);
        speech.lang = 'hi-IN'; // Set language to Hindi
        window.speechSynthesis.speak(speech);
    }

    // Function to play music automatically
    function playMusic() {
        audioPlayer.src = 'path-to-your-audio-file.mp3'; // Specify the path to your audio file
        audioPlayer.play().catch(error => {
            console.log('Autoplay was prevented: ' + error);
        });
    }

    // Audio player controls
    playButton.addEventListener('click', togglePlay);

    function togglePlay() {
        if (audioPlayer.paused) {
            audioPlayer.play();
            playButton.innerHTML = '&#10074;&#10074;'; // Pause Icon
        } else {
            audioPlayer.pause();
            playButton.innerHTML = '&#9658;'; // Play Icon
        }
    }
});
