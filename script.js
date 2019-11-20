/*create empty object of app*/
const furiendFinder = {};

/*storing petFinder api key*/
furiendFinder.petFinderApiKey = "bMlZfEidmf7kNocIPx9z0lC62XwFTmFu94bYQFRRzc8sxD9x6I";

/*needed for oauth*/
furiendFinder.secretPetFinder = "Lwa5bb5fyzQ51KMtEbbJb8QWgItW49OsEuYqgElG";

/*init method, on page load*/
furiendFinder.init = function(){

    const petAgeArray = ["baby", "young", "adult", "senior"];
    /*run a for loop 4 times (0-3) and using the getPetsAvailable method to grab the pet's age and using the petFinder api query to get those words into the function*/
    for(let i = 0; i < 4; i++){
        furiendFinder.getPetsAvailable(petAgeArray[i]);
    }

}

/*find all the available pets for adoption*/
furiendFinder.getPetsAvailable = function(petAge){

    $.ajax({
        url: "https://api.petfinder.com/v2/oauth2/token",
        method: "POST", /*needed for ouath*/
        data: {
            grant_type: "client_credentials",
            client_id: furiendFinder.petFinderApiKey,
            client_secret: furiendFinder.secretPetFinder,
        }
        }).then((token)=>{
            $.ajax({
                url: "https://api.petfinder.com/v2/animals", /*base call*/
            headers:{ /*for ouath*/
                Authorization: `Bearer ${token["access_token"]}`,
            },
            data:{
                age: petAge,
                type: "cat",
                status: "adoptable",
                location: "Toronto, ON" /*change later to a variable*/
            },
            }).then((data)=>{
                const totalPets = data.pagination["total_count"];
                console.log(petAge);
                console.log(totalPets);
                furiendFinder.displayResults(totalPets, petAge);
            })
            
        });

}

/*method to display results into the html*/
furiendFinder.displayResults = function(totalPets, petAge){
    $('.age').append(`
        <li>
            <button class="ageButton ${petAge}">
                <p>${petAge}</p>
                <p>${totalPets}</p>
            </button>
        </li>`);

}

// furiendFinder.getPetsAvailable();
$(document).ready(function(){
    furiendFinder.init();
})

