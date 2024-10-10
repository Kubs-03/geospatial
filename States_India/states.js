// Initialize map
var map = L.map('map').setView([20.593684, 78.96288], 4.3);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

L.Control.geocoder().addTo(map);

let geojson;
let stateLayers = {};  // Store reference to state layers
let score = 0;
let questionIndex = 0;
let shuffledQuestions = [];  // Initialize shuffled questions
let correctSound = document.getElementById("correct-sound");
let incorrectSound = document.getElementById("incorrect-sound");
let questionElement = document.getElementById("question");
let scoreElement = document.getElementById("score");
let startButton = document.getElementById("start-btn");
let quizContainer = document.getElementById("quiz-container");
let resultContainer = document.getElementById("result");

// Questions
const questions = [
    {
        question: "Where is Andhra Pradesh?",
        correctState: "Andhra Pradesh"
    },
    {
        question: "Where is Maharashtra?",
        correctState: "Maharashtra"
    },
    {
        question: "Where is Tamil Nadu?",
        correctState: "Tamil Nadu"
    }, {
        question: "Where is Goa?",
        correctState: "Goa"
    }, {
        question: "Where is West Bengal ?",
        correctState: "West Bengal"
    }, {
        question: "Where is Mizoram?",
        correctState: "Mizoram"
    }
];

// Shuffle function using Fisher-Yates algorithm
function getRandomQuestions(questionsArray) {
    let shuffled = questionsArray.slice();
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled; // Return the shuffled array
}

const backgroundStyle = (feature) => ({
    fillColor: '#ff7800',
    weight: 1,
    opacity: 1,
    color: 'white',
    fillOpacity: 0.2
});

const highlightStyle = (feature) => ({
    fillColor: '#ff7800',
    weight: 5,
    opacity: 1,
    color: '#666',
    fillOpacity: 0.7
});

function highlightFeature(e) {
    var layer = e.target;
    layer.setStyle({
        weight: 5,
        color: '#666',
        fillOpacity: 0.7
    });
    layer.bringToFront();
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
}

function onEachFeature(feature, layer) {
    const stateName = feature.properties.ST_NM.trim();
    stateLayers[stateName] = layer;

    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: function () {
            checkAnswer(stateName);
        }
    });
}

// Fetch GeoJSON and add to map
fetch('states.geojson')
    .then(response => response.json())
    .then(data => {
        geojson = L.geoJSON(data, {
            style: backgroundStyle,
            onEachFeature: onEachFeature
        }).addTo(map);
        
        // Add click event listener to the start button
        startButton.addEventListener("click", startQuiz);
    })
    .catch(error => console.error('Error fetching GeoJSON:', error));

// Start Quiz
function startQuiz() {
    score = 0;
    questionIndex = 0;

    // Shuffle the questions before starting
    shuffledQuestions = getRandomQuestions(questions);
    
    quizContainer.style.display = "block"; // Show the quiz container
    startButton.style.display = "none"; // Hide the start button
    displayQuestion();
}

// Display the current question
function displayQuestion() {
    if (questionIndex < shuffledQuestions.length) {
        questionElement.innerText = shuffledQuestions[questionIndex].question;
    } else {
        endQuiz();
    }
}

// Check the user's answer
function checkAnswer(selectedState) {
    const correctState = shuffledQuestions[questionIndex].correctState;

    if (selectedState === correctState) {
        correctSound.play();
        score++;
    } else {
        incorrectSound.play();
    }

    questionIndex++;
    setTimeout(displayQuestion, 1000);  // Move to the next question after 1 second
}

// End the quiz and display the score
function endQuiz() {
    questionElement.innerText = "Quiz Finished!";
    scoreElement.innerText = "Your Score: " + score + "/" + shuffledQuestions.length;

    // Show play again option
    resultContainer.innerHTML = `<button id="play-again-btn" class="play-again-btn">Play Again</button>`;
    resultContainer.style.display = "block"; // Show the result container

    const playAgainButton = document.getElementById("play-again-btn");
    playAgainButton.addEventListener("click", resetQuiz);
}

// Reset the quiz to the starting state
function resetQuiz() {
    score = 0;
    questionIndex = 0;
    scoreElement.innerText = "";
    quizContainer.style.display = "none"; // Hide quiz container
    resultContainer.style.display = "none"; // Hide results
    startButton.style.display = "block"; // Show the start button again
}
