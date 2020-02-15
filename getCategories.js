/**
 * This function asynchronously retrieves 6 categories and 5 (modular) questions for each category from http://jservice.io/
 * Once all questions are retrived, the categories and questions are displayed using
 */
(function() {
    // If you want to add more questions, just add a value here
    let values = [100, 200, 300, 400, 500];

    // Only fetches if data does not already exist
    if(localStorage.questions === undefined){
        // Where all the questions are stored
        let questions = {};
        // The names of the categories we are using (only for reference; See findCategories.js)
        let categoryStrings = ['potpourriiii', 'stupid answers', 'sports', 'animals', '3 letter words', 'science', 'transportation', 'u.s. cities', 'people', 'television'];
        // The categories we are going to fetch (see findCategories.js)
        let categoryIds = [306, 136, 42, 21, 25, 103];
        // Temporary variable holding the rest of the category IDs
        let tempThing = [7, 442, 67];
        // The url that we are going to fetch
        let url = "http://jservice.io/api/clues?category="

        categoryIds.forEach(id =>{
            values.forEach(value =>{
                fetch(url + id + ";value=" + value)
                .then((response) =>{
                    return response.json();
                })
                .then((data) =>{
                    
                    // Retrieve the category name from the first object in data
                    let categoryName = data[0]["category"]["title"];

                    // This pushes a template with the category name and
                    // an empty array that we will put the questions into 
                    if(!(categoryName in questions)){ // If the template hasn't already been instantiated
                        questions[categoryName] = [];
                    }

                    // Retrieve the questions array corresponding to the category
                    let questionsArray = questions[categoryName];

                    // Push a random question from data (should be the same value as the query)7
                    questionsArray.push(data[Math.floor(Math.random() * data.length)]);

                    // Check to see if we have retrieved all of the questions
                    if(checkDone(questions, values.length)){
                        // Store the questions in localhost (so that we don't have to fetch everytime)
                        localStorage.questions = JSON.stringify(questions);
                        // Display all the questions
                        display(values);
                    }
                })
            })
        });
    }
    // Just display the data
    else{
        display(values);
    }
})();

/**
 * Display is called once the categories and questions have been retrieved. The page consists of four screens that are accessible through different events
 * Screens: Splash, Questions, Answer, Game Over
 * @param {Array} values : Values are the id's of the categories we are retrieving. This allows you to add id's to the array above and the program will adjust
 */
function display(values){
    /* Splash Page */
    document.getElementById("playJeopardy").addEventListener("click", () =>{
        let playerName = document.getElementById("playerNameIn").value;
        if(playerName === ""){
            document.getElementById("splashError").innerText = "Please enter a name";
        }
        else{
            // Set the player name
            document.getElementById("playerName").innerText = playerName;
            // Reset the input field
            document.getElementById("playerNameIn").value = "";
            // Hide the splash screen
            document.getElementById("splash").style.display = "none";
            // Display the questions page
            document.getElementById("questions").style.display = "grid";
            document.getElementsByTagName("header")[0].style.display = "block";
        }
    })

    /* Questions Page */
    let categories = JSON.parse(localStorage.questions);
    let categoryTitles = Object.keys(categories);
    let row = 1;
    let col = 1;
    let numberOfQuestions = categoryTitles.length * values.length;
    let score = 0;
    let questionsCorrect = 15;
    let questionsWrong = 13;

    categoryTitles.forEach((title) =>{
        
        // Sort the questions
        categories[title] = sortQuestionsByValue(categories[title], values);

        // Add the header title
        let header = document.createElement("h1");
        header.innerText = capatalize(title);
        header.style.gridColumn = `${col}/${col + 1}`;
        header.style.gridRow = `${row}/${row + 1}`;
        document.getElementById("questions").appendChild(header);

        // Show each question
        let category = categories[title];
        category.forEach((question) =>{
            // Go to the next row
            row++;
            // Create the HTML element
            let quest = document.createElement("article");
            quest.innerText = question["value"];
            quest.style.gridColumn = `${col}/${col + 1}`;
            quest.style.gridRow = `${row}/${row + 1}`;
            document.getElementById("questions").appendChild(quest);

            // Switch to the answer screen
            quest.addEventListener("click", function questionClick(){
                // Hide questions
                document.getElementById("questions").style.display = "none";
                // Show answer screen
                document.getElementById("answer").style.display = "block";
            
                // Show the buttons and input
                document.getElementById("answerInput").style.visibility = "visible";
                document.getElementById("answerButton").style.visibility = "visible";
                // Sets the display values of the HTML elements
                document.getElementById("answerText").innerText = question["question"];
                document.getElementById("answer2Question").value = question["answer"];
                document.getElementById("answerValue").value = question["value"];
                // Removes the event listener (I know theres a better way to do this)
                quest.removeEventListener("click", questionClick);
                // Remove the text from the article
                quest.innerText = "";
            });
        });
        // Change the column
        col++;
        // Reset the row
        row = 1;
    });

    // Event listener for the answer button
    document.getElementById("answerButton").addEventListener("click", () =>{
        // Get the players answer
        let playerAnswer = document.getElementById("answerInput").value;
        // Initialize the outString. If the input is empty, this stays as the questions. Otherwise it gets changed (either wrong or right)
        let outString = document.getElementById("answerText").innerText;
        // Check to see if the answer has anything in it
        if(playerAnswer === ""){
            // Input was empty
            document.getElementById("errorText").innerText = "Try putting something in!";
        }else{
            // Hide the buttons and input
            document.getElementById("answerInput").style.visibility = "hidden";
            document.getElementById("answerButton").style.visibility = "hidden";
            document.getElementById("switchScreens").style.display = "inline";
            // Get the right answer
            let actualAnswer = document.getElementById("answer2Question").value;
            // Get the value of the question
            let value = parseInt(document.getElementById("answerValue").value, 10);
            // Get the players score
            score = parseInt(document.getElementById("score").innerText, 10);

            // Player Answered Correctly
            if(playerAnswer === actualAnswer){
                outString = `You did it! Your answer was: ${playerAnswer}`;
                questionsCorrect++;
            }
            // Player Answer Incorrectly
            else{
                outString =  `Sorry you got it wrong! Your answer was: ${playerAnswer}. We were looking for ${actualAnswer}`;
                // Will subtract the value instead of add it
                value *= -1;
                questionsWrong++;
            }
            
            // Set the players score
            score += value; 
            document.getElementById("score").innerText = score;
            // Reset the input
            document.getElementById("answerInput").value = "";
            // Adds to the players completed questions
            if(questionsCorrect+ questionsWrong === numberOfQuestions){
                gameOver();
            }
        }
        // Set the outString
        document.getElementById("answerText").innerHTML = outString; 
    })

    // Event listener to switch back to questions screen
    document.getElementById("switchScreens").addEventListener("click", switchToQuestions)

    // Event listener to start the game over
    document.getElementById("playAgain").addEventListener("click", () =>{
        localStorage.removeItem("questions");
        document.location.reload(true);
    })

    /**
     * Called once all the questions have been answered. Shows the final
     * game over screen.
     */
    function gameOver(){
        // Set the values of the HTML elements
        document.getElementById("correct").innerText = questionsCorrect;
        document.getElementById("wrong").innerText = questionsWrong;
        document.getElementById("scoreOut").innerText = score;
    
        // Hide the header and answer screen and show the game over screen
        document.getElementById("answer").style.display = "none";
        document.getElementsByTagName("header")[0].style.display = "none";
        document.getElementById("gameOver").style.display = "block";
    }
}

/**
 * This function sorts the questions by their value. Values can range from 100 - 1000.
 * The values array indicates how to sort the questions. The questions will be sorted based
 * on the postion of the matched value. 
 * Ex. values = [100, 200, 300, 400, 500]
 * Therefore, the sorted output will be in order of the questions whos value is 100,200...etc.
 *
 * @param {Array} questionsIn : The questions to be sorted
 * @param {Array} values : The values that the sort is based on
 */
function sortQuestionsByValue(questionsIn, values){
    // Our output array we will populate
    let sortedQuestions = [];
    // Copy the questions array so we don't modify the original array
    let questions = questionsIn.slice();
    for(let i = 0; i < values.length; i++){
        for(let j = 0; j < questions.length; j++){
            // If the question has the value we want then we push it to the array
            // We remove that question to make this more efficient
            if(questions[j]["value"] === values[i]){
                sortedQuestions.push(questions.splice(j, 1)[0]);
                break;
            }
        }
    }
    return sortedQuestions;
}

/**
 * Check done asserts that the asynchronous calls to get the categories and questions are complete
 * 
 * @param {Object} questions : The object containing all of the catgories and questions
 * @param {Array} length : The number of questions that each category should have
 */
function checkDone(questions, length){
    // Retrieve all the keys
    let keys = Object.keys(questions);
    // Check that every key has the correct number of questions
    return keys.every(categoryName =>{
        return questions[categoryName].length === length;
    }) && Object.keys(questions).length === 6;
}

/**
 * The event call when a question is clicked. Switches to the "answer" screen
 */
function questionClick(){
    // Hide questions
    document.getElementById("questions").style.display = "none";
    // Show answer screen
    document.getElementById("answer").style.display = "block";

    // Show the buttons and input
    document.getElementById("answerInput").style.visibility = "visible";
    document.getElementById("answerButton").style.visibility = "visible";
    // Sets the display values of the HTML tags
    document.getElementById("answerText").innerText = question["question"];
    document.getElementById("answer2Question").value = question["answer"];
    document.getElementById("answerValue").value = question["value"];
}

/**
 * Switches the view to the questions page
 */
function switchToQuestions(){
    // Hide button (Can you just you this or something equivalent?)
    document.getElementById("switchScreens").style.display = "none";
    // Show questions
    document.getElementById("questions").style.display = "grid";
    // hide answer screen
    document.getElementById("answer").style.display = "none";
}

/** 
 * Capatalizes the first letter of the word
 * @param {String} word 
 * Retrieved from https://dzone.com/articles/how-to-capitalize-the-first-letter-of-a-string-in
 */
function capatalize(word){
    let words = word.split(" ");
    words.forEach((currentWord, index) =>{
        words[index] = currentWord.charAt(0).toUpperCase() + currentWord.slice(1);
    })
    return words.join(" ");
}