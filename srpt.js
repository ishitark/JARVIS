document.addEventListener('DOMContentLoaded', () => {
    // Consolidated all initialization code into a single event listener
    speakOnLoad();

    const userInput = document.getElementById('user-input');
    const responseDiv = document.getElementById('response');
    const audioPlayer = document.getElementById('music-player');
    const playButton = document.getElementById('play-btn');

    userInput.addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            handleUserInput(); // Call function to handle user input
        }
    });

    playButton.addEventListener('click', togglePlay);

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
});

// Function to speak a message when the page loads
async function speakOnLoad() {
    const weatherInfo = await getWeatherInfo();
    const detailedWeatherMessage = `नमस्ते! मैं Jarvis हूँ, आपका व्यक्तिगत AI सहायक। ${weatherInfo} अब मैं आपके लिए संगीत चला रहा हूँ।`;
    displayWeatherInfo(weatherInfo);
    speakOut(detailedWeatherMessage);
}

// Function to fetch weather information
async function getWeatherInfo() {
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

// Function to display the weather information on the page
function displayWeatherInfo(weatherInfo) {
    const weatherDiv = document.createElement('div');
    weatherDiv.id = 'weather-info';

    const weatherIconUrl = 'we.JPG'; // Replace with the actual path to your weather icon

    weatherDiv.innerHTML = `
        <img src="${weatherIconUrl}" alt="Weather Icon">
        <p>${weatherInfo}</p>
    `;
    document.body.appendChild(weatherDiv);
}

// Function to speak out text
function speakOut(text) {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'hi-IN'; // Set language to Hindi
    window.speechSynthesis.speak(speech);
}
