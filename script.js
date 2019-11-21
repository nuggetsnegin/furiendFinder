/*create empty object of app*/
const furiendFinder = {};
/*storing petFinder api key*/
furiendFinder.petFinderApiKey = "c8ii4sOOBPTzBQauWmNof3ZNapts6Ld0oBLTY5RZcb4VeOqtcm";
/*needed for oauth*/
furiendFinder.secretPetFinder = "p6b3lhtd4bGo4OxjTEJK3D0eYqllfDGRI6VIXUAF";
/*storing cat api key*/
furiendFinder.catApiKey = "796188a0-0bca-4abe-968b-403b12c2c82d";


/*init method, on page load*/
furiendFinder.init = function () {
    const petAgeArray = ["baby", "young", "adult", "senior"];
    /*run a for loop 4 times (0-3) and using the getPetsAvailable method to grab the pet's age and using the petFinder api query to get those words into the function*/
    for (let i = 0; i < 4; i++) {
        furiendFinder.getPetsAvailable(petAgeArray[i], "cat", "", "Toronto, ON", furiendFinder.getNumPets);
    }
    $(`.ageButton`).on('click', furiendFinder.ageClickEvent); /*only call click event when document ready*/
    $(`.adoptablePets`).on('click', '.adoptionButton', furiendFinder.getMoreInfoCLickEvent);
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
                breed: petBreed,
                limit: 50,
                sort: "random"
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
        for (let i = 0; i < data.length; i++) {
            const petName = data[i].name;
            const petLifeSpan = data[i]["life_span"];
            const petTemperament = data[i].temperament;
            const petOrigin = data[i].origin;
            const petId = data[i].id;
        }
    });
}

furiendFinder.ageClickEvent = function (){
    $(`.petAge`).fadeOut();
    /*rememb er to show next page*/
    const petAge = $(this).val();
    furiendFinder.getPetsAvailable(petAge, "cat", "", "Toronto, ON", furiendFinder.getAdoptablePets);
}

furiendFinder.getMoreInfoCLickEvent = function(){
    $(`.adoptionOptions`).fadeOut();
    const petId = $(this).val();
    console.log(petId);   
}

/*Called after API call - create the buttons for each available adoptable pet by user age selection*/
furiendFinder.getAdoptablePets = function (data, petAge, petType, petBreed, city) {
    console.log(data);
    const animalsArray = data.animals;
    for(let i = 0; i < animalsArray.length; i++){
        if(animalsArray[i].photos[0] !== undefined){
            furiendFinder.adoptableButton(i, animalsArray[i].name, animalsArray[i].breeds.primary,animalsArray[i].photos[0].medium, "cat", animalsArray[i].breeds.mixed );
            console.log(animalsArray[i].name);
        }
    }
    furiendFinder.animalsArray = animalsArray;
}

/*appending the adoptable pets to a button*/
furiendFinder.adoptableButton = function(index, name, breed, url, petType, mixed){
    $(`.adoptablePets`).append(
        `<li>
            <button value = ${index} class="adoptionButton">
                <p>${name}</p>
                <p>${mixed?"mixed":""} ${breed}</p>
                <img src="${url}" alt="photo of ${name} which is a ${mixed?"mixed":""} ${breed} ${petType}">  
            </button>
        </li>`
    )
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
