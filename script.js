/*create empty object of app*/
const furiendFinder = {
    cat: {},
    dog: {}
};
/*storing petFinder api key*/
furiendFinder.petFinderApiKey = "c8ii4sOOBPTzBQauWmNof3ZNapts6Ld0oBLTY5RZcb4VeOqtcm";
/*needed for oauth*/
furiendFinder.secretPetFinder = "p6b3lhtd4bGo4OxjTEJK3D0eYqllfDGRI6VIXUAF";
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
            furiendFinder.getPetsNumberByAge(furiendFinder.petType, furiendFinder.city);
        }).fail(() => {
            furiendFinder.city = "Toronto, ON";
            $(`#location`).val(furiendFinder.city);
            furiendFinder.getPetsNumberByAge(furiendFinder.petType, furiendFinder.city);
        })

        
    }

    const error = (error) => {
        console.log(`Unable to retrieve your location due to ${error.code}: ${error.message}`);
        furiendFinder.city = "Toronto, ON";
        $(`#location`).val(furiendFinder.city);
        furiendFinder.getPetsNumberByAge(furiendFinder.petType, furiendFinder.city);
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
        furiendFinder.getPetsNumberByAge(furiendFinder.petType, furiendFinder.city);
    };
 
}




/*init method, on page load*/
furiendFinder.init = function () {
    
    // furiendFinder.getPetsNumberByAge(furiendFinder.petType,furiendFinder.city);
    $('.ageButton').on('click', furiendFinder.ageClickEvent); /*only call click event when document ready*/
    $('.adoptablePets').on('click', '.adoptionButton', furiendFinder.getMoreInfoCLickEvent);
    furiendFinder.getBreedFacts("cat");
    furiendFinder.getGeoLocation();
    
    $('.petInformation').hide();
    $(`#location`).val(furiendFinder.city).on("blur", furiendFinder.getLocation);

    
}

// Method to get all the available pets by every age
furiendFinder.getPetsNumberByAge = function (petType,city) {
    const petAgeArray = ["baby", "young", "adult", "senior"];
    /*run a for loop 4 times (0-3) and using the getPetsAvailable method to grab the pet's age and using the petFinder api query to get those words into the function*/
    for (let i = 0; i < 4; i++) {
        furiendFinder.getPetsAvailable(petAgeArray[i], petType, city, furiendFinder.getNumPets);
    }
}

/*find all the available pets for adoption*/
furiendFinder.getPetsAvailable = function (petAge, petType,city, functionCall) {
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
        })
    }).fail((error)=>{
        alert("You have enter an invalid location");
    });
}

furiendFinder.getLocation = function () {
    const city = $(`#location`).val();
    console.log(city);
    furiendFinder.getPetsNumberByAge(furiendFinder.petType, city);
}

furiendFinder.getNumPets = function (data, petAge, petType, city, petBreed) {
    const totalPets = data.pagination["total_count"];
    furiendFinder.appendToUl(totalPets, petAge, "age");
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
    $(`.petAge`).fadeOut();
    /*remember to show next page*/
    const petAge = $(this).val();
    furiendFinder.getPetsAvailable(petAge, furiendFinder.petType, furiendFinder.city, furiendFinder.getAdoptablePets);
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
                <p>${mixed?"mixed":""} ${breed}</p>
                <img src="${url}" alt="photo of ${name} which is a ${mixed?"mixed":""} ${breed} ${petType}">  
            </button>
        </li>`
    )
}

/*method to display results into the html*/
furiendFinder.appendToUl = function (totalPets, petAge) {

    $(`.${petAge}`).empty().append(`
        <p>${petAge}</p>
        <p>${totalPets}</p>`
    );
}

furiendFinder.appendInformation = function (name, imgUrl, gender, size, breedName, attributes, description, contact, url, mixed) {

    if(breedName.includes('Domestic')){ /*breed names are different from two APIs*/
        breedName = 'American Shorthair';
    }

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


        $(`.breedFacts`).html(
            `<h3>Breed Facts:
        <ul>
            <li>Average Lifespan: ${breedLifeSpan}</li>
            <li>Average Weight: ${breedWeight}</li>
            <li>Origin: ${breedOrigin}</li>
            <li>Affection Level: ${breedAffection}</li>
            <li>Adaptability Level: ${breedAdaptability}</li>
            <li>Child Friendly Level: ${breedChildFriendly}</li>
            <li>Energy Level: ${breedEnergy}</li>
            <li>Temperament: ${breedTemperament}</li>
        </ul>`
        )
    }

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
        `<p>${description}</p>`
    )

    $(`.petLocation`).html(
        /*using conditionals for error handling API information*/
        `<p>Organization Email: ${contact.email?contact.email:"No email available"}</p>
        <p>Organization Phone Number: ${contact.phone ? contact.phone : "No phone number available"}</p>
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