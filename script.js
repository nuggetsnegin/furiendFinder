/*create empty object of app*/
const furiendFinder = {};

/*storing petFinder api key*/
furiendFinder.petFinderApiKey = "bMlZfEidmf7kNocIPx9z0lC62XwFTmFu94bYQFRRzc8sxD9x6I";

/*needed for oauth*/
furiendFinder.secretPetFinder = "Lwa5bb5fyzQ51KMtEbbJb8QWgItW49OsEuYqgElG";

furiendFinder.catApiKey = "796188a0-0bca-4abe-968b-403b12c2c82d";

/*init method, on page load*/
furiendFinder.init = function () {

    const petAgeArray = ["baby", "young", "adult", "senior"];
    /*run a for loop 4 times (0-3) and using the getPetsAvailable method to grab the pet's age and using the petFinder api query to get those words into the function*/

    /*change to ordered array*/
    for (let i = 0; i < 4; i++) {
        furiendFinder.getPetsAvailable(petAgeArray[i], "cat", "", "Toronto, ON");
    }

}

/*find all the available pets for adoption*/
furiendFinder.getPetsAvailable = function (petAge, petType, petBreed, city) {

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
            const totalPets = data.pagination["total_count"];
            console.log(petAge);
            console.log(totalPets);
            furiendFinder.appendToUl(totalPets, petAge, "age");
        })

    });
}

/*accessing catAPI for cat breed facts*/
furiendFinder.getBreedFacts = function () {

    $.ajax({
        url: "https://api.thecatapi.com/v1/breeds/",
        headers: {
            "x-api-key": furiendFinder.catApiKey
        },
    }).then((data) => {
        console.log(data);

        for (let i = 0; i < data.length; i++) {
            const petName = data[i].name;
            const petLifeSpan = data[i]["life_span"];
            const petTemperament = data[i].temperament;
            const petOrigin = data[i].origin;
            const petId = data[i].id;
            furiendFinder.createBreedsButton(petName, petLifeSpan, petTemperament, petOrigin);

            $.ajax({
                url: "https://api.thecatapi.com/v1/images/search",
                headers: {
                    "x-api-key": furiendFinder.catApiKey
                },
            }).then((data) => {
                console.log(data);
            })
        }

    });
}

/*method to display results into the html*/
furiendFinder.appendToUl = function (totalPets, petAge, className) {
    $(`.${className}`).append(
        `<li>
            <button class="ageButton ${petAge}">
                <p>${petAge}</p>
                <p>${totalPets}</p>
            </button>
        </li>`);
}

furiendFinder.createBreedsButton = function (petName, petLifeSpan, petTemperament, petOrigin, petId) {

    $('.breeds').append(
        `<li>
            <button class="breedButton">
                <p>Name: ${petName}</p>
                <p>Origin: ${petOrigin}</p>
                <p>Temperament: ${petTemperament}</p>
                <p>Life Span: ${petLifeSpan}</p>
            </button>
        </li>`
    )

}

// furiendFinder.getPetsAvailable();
$(document).ready(function () {
    furiendFinder.init();
    furiendFinder.getBreedFacts();
})