/*create empty object of app*/
const furiendFinder = {};

/*storing petFinder api key*/
furiendFinder.petFinderApiKey = "c8ii4sOOBPTzBQauWmNof3ZNapts6Ld0oBLTY5RZcb4VeOqtcm";

/*needed for oauth*/
furiendFinder.secretPetFinder = "p6b3lhtd4bGo4OxjTEJK3D0eYqllfDGRI6VIXUAF";

furiendFinder.catApiKey = "796188a0-0bca-4abe-968b-403b12c2c82d";

/*init method, on page load*/
furiendFinder.init = function () {

    const petAgeArray = ["baby", "young", "adult", "senior"];
    /*run a for loop 4 times (0-3) and using the getPetsAvailable method to grab the pet's age and using the petFinder api query to get those words into the function*/

    for (let i = 0; i < 4; i++) {
        furiendFinder.getPetsAvailable(petAgeArray[i], "cat", "", "Toronto, ON", furiendFinder.getNumPets);
    }

    $(`.ageButton`).on('click', furiendFinder.ageClickEvent); /*only call click event when document ready*/

}

/*find all the available pets for adoption*/
furiendFinder.getPetsAvailable = function (petAge, petType, petBreed, city, functionCall) {

    $.ajax({
        url: "https://api.petfinder.com/v2/oauth2/token",
        method: "POST",
        /*needed for ouath*/
        data: {
            grant_type: "client_credentials",
            client_id: furiendFinder.petFinderApiKey,
            client_secret: furiendFinder.secretPetFinder,
        }
    }).then((token) => {
        $.ajax({
            url: "https://api.petfinder.com/v2/animals",
            /*base call*/
            headers: {
                /*for ouath*/
                Authorization: `Bearer ${token["access_token"]}`,
            },
            data: {
                age: petAge,
                type: petType,
                status: "adoptable",
                location: city,
                /*change later to a variable*/
                breed: petBreed
            },
        }).then((data) => {
            functionCall(data, petAge, petType, city, petBreed);
        })

    });
}

furiendFinder.getNumPets = function (data, petAge, petType, city, petBreed) {
    const totalPets = data.pagination["total_count"];
    furiendFinder.appendToUl(totalPets, petAge, "age");
}

/*accessing catAPI for cat breed facts*/
furiendFinder.getBreedFacts = function () {

    $.ajax({
        url: "https://api.thecatapi.com/v1/breeds/",
        headers: {
            "x-api-key": furiendFinder.catApiKey
        },
    }).then((data) => {
        // console.log(data);
        for (let i = 0; i < data.length; i++) {
            const petName = data[i].name;
            const petLifeSpan = data[i]["life_span"];
            const petTemperament = data[i].temperament;
            const petOrigin = data[i].origin;
            const petId = data[i].id;
            // furiendFinder.createBreedsButton(petName, petLifeSpan, petTemperament, petOrigin);
        }

    });
}

furiendFinder.ageClickEvent = function (){
    $(`.petAge`).fadeOut();
    const petAge = $(this).val();
    furiendFinder.getPetsAvailable(petAge, "cat", "", "Toronto, ON", );

    
}


furiendFinder.getAdoptablePets = function (data, petAge, petType, petBreed, city) {


}

/*method to display results into the html*/
furiendFinder.appendToUl = function (totalPets, petAge) {
        $(`.${petAge}`).html(`
        <p>${petAge}</p>
        <p>${totalPets}</p>`);
}



// furiendFinder.createBreedsButton = function (petName, petLifeSpan, petTemperament, petOrigin, petId) {

//     $('.breeds').append(
//         `<li>
//                 <p>Name: ${petName}</p>
//                 <p>Origin: ${petOrigin}</p>
//                 <p>Temperament: ${petTemperament}</p>
//                 <p>Life Span: ${petLifeSpan}</p>
//         </li>`
//     )

// }

// furiendFinder.getPetsAvailable();
$(document).ready(function () {
    furiendFinder.init();
    furiendFinder.getBreedFacts();
})

// https://api.thecatapi.com/v1/images/search?limit=1&mime_types=jpg,png&order=Desc&size=small&page=0&breed_ids=awir
// Get breed_id and place where "awir" is, get "url" key for image.