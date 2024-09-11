document.addEventListener('DOMContentLoaded', () => {
    const introVideo = document.getElementById('intro-video');
    const splashScreen = document.getElementById('splash-screen');

    // Unmute and play the video when the page loads
    introVideo.muted = false; // Ensure the video is unmuted
    introVideo.play(); // Play the video

    // When the video ends, hide the splash screen and trigger the greeting
    introVideo.onended = () => {
        splashScreen.style.display = 'none'; // Hide the splash screen
        speakOnLoad(); // Call the greeting function
    };

    // Optional: Handle errors or interruptions
    introVideo.onerror = () => {
        splashScreen.style.display = 'none'; // Hide splash screen on error
        console.error('Error playing video.');
        speakOnLoad(); // Call the greeting function
    };

    // Optional: Handle the case where the video is paused before it ends
    introVideo.onpause = () => {
        if (introVideo.currentTime < introVideo.duration) {
            console.warn('Video was paused before it ended.');
            splashScreen.style.display = 'none'; // Hide splash screen if needed
            speakOnLoad(); // Call the greeting function
        }
    };
});
