/*create empty object of app*/
const furiendFinder = {
    cat: {},
    dog: {}
};
/*storing petFinder api key*/
furiendFinder.petFinderApiKey = "bMlZfEidmf7kNocIPx9z0lC62XwFTmFu94bYQFRRzc8sxD9x6I";
/*needed for oauth*/
furiendFinder.secretPetFinder = "Lwa5bb5fyzQ51KMtEbbJb8QWgItW49OsEuYqgElG";
/*storing cat api key*/
furiendFinder.catApiKey = "796188a0-0bca-4abe-968b-403b12c2c82d";

// MapQuest api Key
furiendFinder.mapQuestKey = "gVcJABFXiDTymAro7AI80OiMBbUOCygN";

// storing pet type
furiendFinder.petType = "cat";

// Making a property to store the user's city
furiendFinder.city = "";

// Geolocation function to get the city and province of the user. If the geolocation is not allowed then Toronto will be the default.

furiendFinder.getGeoLocation = () => {

    const success = (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        
        $.ajax({
            url: `http://open.mapquestapi.com/geocoding/v1/reverse/`,
            data: {
                key: furiendFinder.mapQuestKey,
                location: `${latitude},${longitude}`
            }
        }).then((data) => {
            console.log(data);
            const city = data.results[0].locations[0]["adminArea5"];
            const province = data.results[0].locations[0]["adminArea3"];
            furiendFinder.city = `${city}, ${province}`;
            $(`#location`).val(furiendFinder.city);
            $(`.typeButton`).removeAttr("disabled");
        }).fail(() => {
            furiendFinder.city = "Toronto, ON";
            $(`#location`).val(furiendFinder.city);
            $(`.typeButton`).removeAttr("disabled");
        })

    }

    const error = (error) => {
        console.log(`Unable to retrieve your location due to ${error.code}: ${error.message}`);
        furiendFinder.city = "Toronto, ON";
        $(`#location`).val(furiendFinder.city);
        $(`.typeButton`).removeAttr("disabled");
    }

    const geoOptions = {
        enableHighAccuracy: true,
        maximumAge: 30000,
        timeout: 27000
    };

    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, error, geoOptions);
    } else {
        console.log("Geolocation services are not supported by your web browser.");
        furiendFinder.city = "Toronto, ON";
        $(`#location`).val(furiendFinder.city);
        $(`.typeButton`).removeAttr("disabled");
        
    };
 
}


/*init method, on page load*/
furiendFinder.init = function () {

    
    $('.ageButton').on('click', furiendFinder.ageClickEvent); /*only call click events atached to buttons when document ready*/
    $('.adoptablePets').on('click', '.adoptionButton', furiendFinder.getMoreInfoCLickEvent);

    // Getting breeds facts on initialization
    furiendFinder.getBreedFacts("cat");
    furiendFinder.getBreedFacts("dog");

    $(`.typeButton`).on(`click`, furiendFinder.selectPetTypeClickEvent);

    $(`.acceptAlert`).on("click", function () {
        $(`.alert`).fadeOut();
    })

    $(`.backButtonToType`).on("click", function () {
        $(`.petAge`).fadeOut();
        $(`.petType`).fadeIn();
    });
    $(`.backButtonToAge`).on("click", function () {
        $(`.adoptionOptions`).fadeOut();
        $(`.petAge`).fadeIn();
    });
    $(`.backButtonToOptions`).on("click", function () {
        $(`.petInformation`).fadeOut();
        $(`.adoptionOptions`).fadeIn();
    })

    //Calling the functiion to ask the user for the location 
    furiendFinder.getGeoLocation();
    
    // We make sure the other divs of the App are not displayed
    $('.petInformation').hide();
    $(`.petAge`).hide();
    $(`.adoptionOptions`).hide();
    $(`.alert`).hide();
    $(`.loadingScreen`).hide();

    // We disabled the type buttons until the user has entered the location
    $(`.typeButton`).attr("disabled","true");
    

    
}

// Click event for the buttons to select the pet type(cat or dog)
furiendFinder.selectPetTypeClickEvent = function () {
    furiendFinder.city = $(`#location`).val();
    $(`.adoptablePets`).empty();
    furiendFinder.petType = $(this).val();
    furiendFinder.getBreedFacts(furiendFinder.petType);
    furiendFinder.getPetsNumberByAge(furiendFinder.petType, furiendFinder.city);
}

// Method to get all the available pets by every age
furiendFinder.getPetsNumberByAge = function (petType,city) {
    const petAgeArray = ["baby", "young", "adult", "senior"];
    /*run a for loop 4 times (0-3) and using the getPetsAvailable method to grab the pet's age and using the petFinder api query to get those words into the function*/
    for (let i = 0; i < 4; i++) {
        furiendFinder.getPetsAvailable(petAgeArray[i], petType, city, furiendFinder.getNumPets,"petType","petAge");
    }
}

/*find all the available pets for adoption*/
furiendFinder.getPetsAvailable = function (petAge, petType,city, functionCall, disappearingDivClass, appearingDivClass) {
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
                distance: 31,
                /*50miles in km*/
                location: city,
                /*change later to a variable*/
                limit: 50,
                sort: "random"
            },
        }).then((data) => {
            furiendFinder.city = city;
            functionCall(data, petAge, petType, city);
            $(`.${disappearingDivClass}`).fadeOut();
            $(`.${appearingDivClass}`).fadeIn();
        }).fail((error) => {
            $(`.alert`).fadeIn();
            
        });
    })
}


furiendFinder.getNumPets = function (data, petAge, petType, city, petBreed) {
    const totalPets = data.pagination["total_count"];
    furiendFinder.appendToUl(totalPets, petAge, petType);
}

/*accessing catAPI for cat breed facts*/
furiendFinder.getBreedFacts = function (petType) {
    $.ajax({
        url: `https://api.the${petType}api.com/v1/breeds`,
        headers: {
            "x-api-key": furiendFinder.catApiKey
        },
    }).then((dataArray) => {
        furiendFinder[petType].breedInfo = {};

        dataArray.forEach(function (data) {
            furiendFinder[petType].breedInfo[data.name] = data;
        });
    });
}

furiendFinder.ageClickEvent = function () {
    $(`.adoptablePets`).empty();
    const petAge = $(this).val();
    furiendFinder.getPetsAvailable(petAge, furiendFinder.petType, furiendFinder.city, furiendFinder.getAdoptablePets,"petAge","adoptionOptions");
}

furiendFinder.getMoreInfoCLickEvent = function () {
    $(`.adoptionOptions`).fadeOut();
    const petIndex = $(this).val();
    const petType = furiendFinder.petType;
    const animalArray = furiendFinder[petType].animalsArray[petIndex];

    const breedName = animalArray.breeds.primary;

    const name = animalArray.name;
    const imgUrl = animalArray.photos[0].medium;
    const gender = animalArray.gender;
    const petBreed = animalArray.breeds.primary;
    const size = animalArray.size;
    const attributes = animalArray.attributes;
    const contact = animalArray.contact;
    const url = animalArray.url;
    const mixed = animalArray.mixed;
    const description = animalArray.description;

    furiendFinder.appendInformation(name, imgUrl, gender, size, petBreed, attributes, description, contact, url, mixed);

    $('.petInformation').show();
}

/*Called after API call - create the buttons for each available adoptable pet by user age selection*/
furiendFinder.getAdoptablePets = function (data, petAge, petType, petBreed, city) {
    console.log(data);
    const animalsArray = data.animals;
    for (let i = 0; i < animalsArray.length; i++) {
        if (animalsArray[i].photos[0] !== undefined) {
            furiendFinder.adoptableButton(i, animalsArray[i].name, animalsArray[i].breeds.primary, animalsArray[i].photos[0].medium, "cat", animalsArray[i].breeds.mixed);
            console.log(animalsArray[i].name);
        }
    }

    furiendFinder[petType].animalsArray = animalsArray;
}

/*appending the adoptable pets to a button*/
furiendFinder.adoptableButton = function (index, name, breed, url, petType, mixed) {

    $(`.adoptablePets`).append(
        `<li>
            <button value = ${index} class="adoptionButton">
                <p>${name}</p>
                <p>${mixed?"Mixed":""} ${breed}</p>
                <img src="${url}" alt="photo of ${name} which is a ${mixed?"mixed":""} ${breed} ${petType}">  
            </button>
        </li>`
    )
}

/*method to display results into the html*/
furiendFinder.appendToUl = function (totalPets, petAge, petType) {

    $(`.${petAge}`).empty().append(`
        <p>${petAge}</p>
        <img src="./assets/${petAge}.PNG">
        <p>${totalPets}</p>`
    );
}

furiendFinder.appendInformation = function (name, imgUrl, gender, size, breedName, attributes, description, contact, url, mixed) {

    if(breedName.includes('Domestic')){ /*breed names are different from two APIs*/
        breedName = 'American Shorthair';
    }

    $(".breedFacts").remove();

    const petType = furiendFinder.petType;

    const breedFactsInfo = furiendFinder[petType].breedInfo[breedName];

    if (breedFactsInfo !== undefined) {

        const breedLifeSpan = breedFactsInfo["life_span"];
        const breedTemperament = breedFactsInfo["temperament"];
        const breedOrigin = breedFactsInfo["origin"];
        const breedWeight = breedFactsInfo["weight"]["metric"];
        const breedAffection = breedFactsInfo["affection_level"];
        const breedAdaptability = breedFactsInfo["adaptability"];
        const breedChildFriendly = breedFactsInfo["child_friendly"];
        const breedEnergy = breedFactsInfo["energy_level"];


        $(`.petFacts`).after(
            `<div class="breedFacts">
            <h3>Breed Facts:</h3>
            <ul>
                ${breedTemperament ? `<li>Temperament: ${breedTemperament}</li>` : ""}
                ${breedLifeSpan?`<li>Average Lifespan: ${breedLifeSpan}</li>`:""}
                ${breedWeight?`<li>Average Weight: ${breedWeight} kg</li>`:""}
                ${breedOrigin?`<li>Origin: ${breedOrigin}</li>`:""}
                ${breedAffection?`<li>Affection Level: ${breedAffection}</li>`:""}
                ${breedAdaptability?`<li>Adaptability Level: ${breedAdaptability}</li>`:""}
                ${breedChildFriendly?`<li>Child Friendly Level: ${breedChildFriendly}</li>`:""}
                ${breedEnergy?`<li>Energy Level: ${breedEnergy}</li>`:""}
            </ul>
            </div>`
        )
    };

    $(`.petName`).html(
        `${name}`
    )

    $(`.petImage`).html(
        `<img src="${imgUrl}">`
    )

    $(`.petFactsUl`).html(
        `<li>Breed: ${mixed?"Mixed":""} ${breedName}</li>
        <li>Gender: ${gender}</li>
        <li>Size: ${size}</li>`
    )

    for (attribute in attributes) {
        $(`.petFactsUl`).append(
            `<li>${attribute.replace('_',' ')}: ${attributes[attribute]?"✔":"✖"}</li>`
        )
    }

    $(`.petStory`).html(
        `<h3>My Story: </h3><p>${description?description:"I'm a little shy, contact me to learn more about me!"} <a href="${url}">read more</a></p>`
    )

    $(`.petLocation`).html(
        /*using conditionals for error handling API information*/
        `<h3>Organization: </h3>
        <p>Email: ${contact.email?contact.email:"No email available"}</p>
        <p>Phone Number: ${contact.phone ? contact.phone : "No phone number available"}</p>
        <ul></ul>`
    )
    
    console.log(contact.address);
    for (contacts in contact.address) {
    /*not showing null if no address available*/
        
        if (contact.address[contacts] !== null && contact.address[contacts] !== "") {
            $(`.petLocation ul`).append(
                `<li>${contacts}: ${contact.address[contacts]}<li>`
            )
        }

    }



    $(`.adoptMe`).html(
        `<a href=${url + "#animal_adoption_inquiry_guest_profile_firstName"}>Adopt Me!</a>`
    )
}

$(document).ready(function () {
    furiendFinder.init();
    
})