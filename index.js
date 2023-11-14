import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, update, set } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"

const appSettings = {
    databaseURL: "https://we-are-the-champions-72c12-default-rtdb.europe-west1.firebasedatabase.app/"
}

// Firebase settings
const app = initializeApp(appSettings)
const database = getDatabase(app)
const endorsementsInDB = ref(database, "endorsementList")

// DOM constants
const publishBtn = document.getElementById("publish-btn")
const endorsementTextArea = document.getElementById("endorsement-text-area")
const fromInput = document.getElementById("from-input")
const toInput = document.getElementById("to-input")
const cardContainer = document.getElementById("card-container")


let allRequiredInputs = true

onValue(endorsementsInDB, function(snapshot) {
    const endorsementsData = snapshot.val()
    if (endorsementsData) {
        const endorsementsArray = Object.entries(endorsementsData)
        
        clearEndorsements()
        for (let i = 0; i < endorsementsArray.length; i++) {
            const currentEndorsement = endorsementsArray[i]
            const currentEndorsementID = currentEndorsement[0]
            const currentEndorsementValue = currentEndorsement[1]
            createCard(currentEndorsementID, currentEndorsementValue)
        }
    }
})

publishBtn.addEventListener("click", function() {
    getInfo()
    if (allRequiredInputs) {
       createNewDatabaseEntry()
    }
    resetAllInputs()
})

// get all the info entered by the user
function getInfo() {    
    if (!endorsementTextArea.value || !fromInput.value || !toInput.value) {
            alert("All fields are required")
            allRequiredInputs = false
        }
}

// create new object and push new DB Entry with all the input info
function createNewDatabaseEntry() {

    const newDatabaseEntry = {
                                msg: endorsementTextArea.value, 
                                sender: fromInput.value,
                                to: toInput.value, 
                                likes: 0
                            }
    push(endorsementsInDB, newDatabaseEntry)
}

// create the new card element with all the input info
function createCard(endorsementID, endorsementValue) {
    const div = document.createElement("div")
    div.innerHTML = `
                    <h4>To ${endorsementValue.to}</h4>
                    <p>${endorsementValue.msg}</p>
                    <div class="card-bottom">
                        <h4>From ${endorsementValue.sender}</h4>
                        <div class="liked">
                            <i class="fas fa-heart" id=${endorsementID}></i>
                            <h3 id="${endorsementID}_likes">${endorsementValue.likes}</h3>
                        </div>
                    </div>
                    `
    div.className = "card"

    cardContainer.insertBefore(div, cardContainer.firstChild)
    addFavouriteEventListener(endorsementID, endorsementValue)
}

// listen for clicks on hearts
function addFavouriteEventListener(ID, value) {
    const favouriteIcon = document.getElementById(ID)
    favouriteIcon.addEventListener("click", function() {
        // Specify the path to the endorsement
        const endorsementRef = ref(database, `endorsementList/${ID}`)

        // New likes value
        const likes = value.likes + 1

        // Update the likes value
        update(endorsementRef, {
            likes: likes
        })
    })
}

function resetAllInputs() {
    endorsementTextArea.value = ""
    fromInput.value = ""
    toInput.value = ""
    allRequiredInputs = true
}

function clearEndorsements() {
    cardContainer.innerText = ""
}