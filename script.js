document.addEventListener("DOMContentLoaded", function() {
    const assistantResponse = document.getElementById('assistant-response');
    const assistantForm = document.getElementById('assistant-form');
    const startVoiceInteractionButton = document.getElementById('start-voice-interaction');
    const nameInput = document.getElementById('name');
    const symptomsInput = document.getElementById('symptoms');
    let step = 0;

    // Voice synthesis
    function speak(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        speechSynthesis.speak(utterance);
    }

    // Voice recognition
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = function(event) {
        const speechResult = event.results[0][0].transcript.toLowerCase();
        handleVoiceInput(speechResult);
    };

    recognition.onerror = function(event) {
        speak("Error occurred in recognition: " + event.error);
    };

    startVoiceInteractionButton.addEventListener('click', function() {
        startVoiceInteractionButton.style.display = 'none';
        startInteraction();
    });

    function startInteraction() {
        speak("hii ishita!I heard you are not feeling right today?");
        assistantResponse.innerText = "hii ishita!I heard you are not feeling right today?";
        recognition.start();
    }

    function handleVoiceInput(input) {
        switch (step) {
            case 1:
                // Capture name and ask for symptoms
                nameInput.value = input;
                speak("Okk ishita now tell from what symptoms you are suffering, " + nameInput.value + ". Can you please tell me your symptoms?");
                assistantResponse.innerText = "Okk ishita now tell from what symptoms you are suffering, " + nameInput.value + ". Can you please tell me your symptoms?";
                step++;
                recognition.start();
                break;
            case 2:
                // Capture symptoms and display prescription
                symptomsInput.value = input;
                speak("Thank you for sharing your symptoms. Based on what you've told me, I recommend taking some rest and if symptoms persist, consult a doctor.");
                assistantResponse.innerText = "Thank you for sharing your symptoms. Based on what you've told me, I recommend taking some rest and if symptoms persist, consult a doctor.";
                break;
            default:
                // End interaction
                speak("Thank you for using the personal assistant. Have a great day!");
                assistantResponse.innerText = "Thank you for using the personal assistant. Have a great day!";
                break;
        }
    }

    // Add event listener to handle form submission
    assistantForm.addEventListener('submit', function(event) {
        event.preventDefault();
        // Handle form submission (e.g., send data to server, show a success message, etc.)
        alert('Form submitted!');
    });
});

