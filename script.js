// asdf
// Unescape any special characters from responses, such as %20 or &#39;s
function unescape(string){
    return new DOMParser().parseFromString(string, 'text/html').querySelector('html').textContent;
}

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
    // $('.popInCat').hide();
    // $('.popInDog').hide();
    $('.ageButton').on('click', furiendFinder.ageClickEvent); /*only call click events atached to buttons when document ready*/
    $('.adoptablePets').on('click', '.adoptionButton', furiendFinder.getMoreInfoCLickEvent);

    // Getting breeds facts on initialization
    furiendFinder.getBreedFacts("cat");
    furiendFinder.getBreedFacts("dog");

    $(`.typeButton`).on(`click`, furiendFinder.selectPetTypeClickEvent);

    $(`.acceptAlert`).on("click", function () {
        $(`.alert`).fadeOut();
    })

    $(`header`).on("click", ".backButtonToType",function () {
        $(`.petAge`).hide();
        $(`.petType`).show();
        $(".backButton").hide();
    });
    $(`header`).on("click", `.backButtonToAge`, function () {
        $(`.adoptionOptions`).hide();
        $(`.petAge`).fadeIn();
        $(".backButtonToType").show();
        $(".backButtonToAge").hide();
    });
    $(`header`).on("click", `.backButtonToOptions`, function () {
        $(`.petInformation`).fadeOut();
        $(`.adoptionOptions`).fadeIn();
        $(".backButtonToAge").show();
        $(".backButtonToOptions").hide();
    })

    $(`.petImage button`).on("click", furiendFinder.pictureChange);

    //Calling the functiion to ask the user for the location 
    furiendFinder.getGeoLocation();
    
    // We make sure the other divs of the App are not displayed
    $(`.petInformation`).hide();
    $(`.petAge`).hide();
    $(`.adoptionOptions`).hide();
    $(`.alert`).hide();
    $(`.loadingScreen`).hide();
    $(`.backButton`).hide();

    $("h1").on("click", () => {
        $(`.petAge`).hide();
        $(`.petInformation`).hide();
        $(`.adoptionOptions`).hide();
        $(`.petType`).fadeIn();

    })

    // We disabled the type buttons until the user has entered the location
    $(`.typeButton`).attr("disabled","true");
    
}

// Click event for the buttons to select the pet type(cat or dog)
furiendFinder.selectPetTypeClickEvent = function () {
    $(`.loadingScreen`).fadeIn();
    furiendFinder.city = $(`#location`).val();
    $(`.adoptablePets`).empty();
    furiendFinder.petType = $(this).val();
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
            // setTimeout(() => {
                $(`.loadingScreen`).fadeOut();
            // }, 1000);
            
            functionCall(data, petAge, petType, city);
            $(`.${disappearingDivClass}`).hide();
            $(`.${appearingDivClass}`).show();
            if (appearingDivClass === "petAge") {
                $(`.backButtonToType`).show();
            } else {
                $(".backButtonToAge").show();
                $(".backButtonToType").hide();
            }
        }).fail((error) => {
            $(`.loadingScreen`).fadeOut();
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
    $(`.loadingScreen`).fadeIn();
    const petAge = $(this).val();
    furiendFinder.getPetsAvailable(petAge, furiendFinder.petType, furiendFinder.city, furiendFinder.getAdoptablePets,"petAge","adoptionOptions");
}

furiendFinder.getMoreInfoCLickEvent = function () {
    $(`.adoptionOptions`).hide();
    $(".backButtonToAge").hide();
    $(".backButtonToOptions").show();
    const petIndex = $(this).val();
    const petType = furiendFinder.petType;
    const animalArray = furiendFinder[petType].animalsArray[petIndex];

    const { name, photos, gender, breeds, size, attributes, contact, url, mixed } = animalArray;

    const description = unescape(animalArray.description); /*fixing escaping characters on description api call*/

    furiendFinder.appendInformation(name, photos, gender, size, breeds.primary, attributes, description, contact, url, mixed);

    $('.petInformation').fadeIn();
}

/*Called after API call - create the buttons for each available adoptable pet by user age selection*/
furiendFinder.getAdoptablePets = function (data, petAge, petType, petBreed, city) {
    const animalsArray = data.animals;
    for (let i = 0; i < animalsArray.length; i++) {
        if (animalsArray[i].photos[0] !== undefined) {
            furiendFinder.adoptableButton(i, animalsArray[i].name, animalsArray[i].breeds.primary, animalsArray[i].photos[0].medium, "cat", animalsArray[i].breeds.mixed);
        }
    }

    furiendFinder[petType].animalsArray = animalsArray;
}

/*appending the adoptable pets to a button*/
furiendFinder.adoptableButton = function (index, name, breed, url, petType, mixed) {

    $(`.adoptablePets`).append(
        `<li data-aos="fade-up">
            <button value = ${index} class="adoptionButton">
                <img src="${url}" alt="photo of ${name} which is a ${mixed ? "mixed" : ""} ${breed} ${petType}">
                <div class="info">
                <p>${name}</p>
                <p>${mixed ? "Mixed" : ""} ${breed}</p>  
                </div>
            </button>
        </li>`
    )
}

// method to make pictures change
furiendFinder.pictureChange = function () {
    $(`.petImage img`).css("transform", `translate(-100%)`);

}

/*method to display results into the html*/
furiendFinder.appendToUl = function (totalPets, petAge, petType) {

    $(`.${petAge}`).empty().append(`
        <p>${petAge}</p>
        <img src="./assets/${petAge}${petType}.PNG">
        <p>${totalPets} available</p>`
    );
}

furiendFinder.appendInformation = function (name, photos, gender, size, breedName, attributes, description, contact, url, mixed) {

    if(breedName.includes('Domestic')){ /*breed names are different from two APIs*/
        breedName = 'American Shorthair';
    }

    $(".breedFacts").remove();

    const petType = furiendFinder.petType;

    const breedFactsInfo = furiendFinder[petType].breedInfo[breedName];

    if (breedFactsInfo !== undefined) {

        const { life_span,temperament,origin,weight,affection_level,adaptability,child_friendly,energy_level} = breedFactsInfo

        $(`.petFacts`).after(
            `<div class="breedFacts">
            <h3>Breed Facts:</h3>
            <ul>
                ${temperament ? `<li><span class="reColor">Temperament:</span> ${temperament}</li>` : ""}
                 ${life_span?`<li><span class="reColor">Average Lifespan: </span> ${life_span}</li>`:""}
                 ${weight.metric?`<li><span class="reColor">Average Weight: </span> ${weight.metric} kg</li>`:""}
                 ${origin?`<li><span class="reColor">Origin:</span> ${origin}</li>`: ""}
                 ${affection_level?`<li><span class="reColor">Affection Level:</span> <div class="factmeter${affection_level}"></div></li>`: ""}
                 ${adaptability ? `<li><span class="reColor">Adaptability Level:</span> <div class="factmeter${adaptability}"></div></li>`: ""}
                 ${child_friendly ? `<li><span class="reColor">Child Friendly Level:</span> <div class="factmeter${child_friendly}"></div></li>`:""}
                 ${energy_level ? `<span class="reColor"><li>Energy Level:</span> <div class="factmeter${energy_level}"></div></li>`:""}
            </ul>
            </div>`
        )
    };

    $(`.petName`).html(
        `${name}`
    )

    $(`.petImage img`).remove();

    if (photos.length <= 1) {
        $(`.petImage button`).hide();
    } else {
        $(`.petImage button`).show();
    }

    photos.forEach((photo, index) => {
        
        $(`.petImage`).append(
            `<img src="${photo.medium}">`)
              
    })
    
    $(`.petFactsUl`).html(
        `<li><span class="reColor">Breed:</span> ${mixed?"Mixed":""} ${breedName}</li>
        <li><span class="reColor">Gender:</span> ${gender}</li>
        <li><span class="reColor">Size:</span> ${size}</li>`
    )

    for (attribute in attributes) {
        $(`.petFactsUl`).append(
            `<li><span class="reColor">${attribute.replace('_',' ')}:</span> ${attributes[attribute]?"✔":"✖"}</li>`
        )
    }

    $(`.petStory`).html(
        `<h3>My Story: </h3><p>${description !== "null" ? `${description} <a href = "${url}" > read more</a >`:"I'm a little shy, contact me to learn more about me!"} </p>`
    )

    $(`.petLocation`).html(
        /*using conditionals for error handling API information*/
        `<h3>Organization: </h3>
        <p><span class="reColor">E-mail:</span> ${contact.email?contact.email:"No email available"}</p>
        <p><span class="reColor">Phone #:</span> ${contact.phone ? contact.phone : "No phone number available"}</p>
        <ul></ul>`
    )
    
    for (contacts in contact.address) {
    /*not showing null if no address available*/     
        if (contact.address[contacts] !== null && contact.address[contacts] !== "") {
            $(`.petLocation ul`).append(
                `<li><span class="reColor">${contacts}:</span> ${contact.address[contacts]}<li>`
            )
        }

    }
    $(`.adoptMe`).html(
        `<a href=${url + "#animal_adoption_inquiry_guest_profile_firstName"}>Adopt Me!</a>`
    )
}


// Default settings for the Animation On Scroll Library
AOS.init({
    // Global settings:
    disable: false, // accepts following values: 'phone', 'tablet', 'mobile', boolean, expression or function
    startEvent: 'DOMContentLoaded', // name of the event dispatched on the document, that AOS should initialize on
    initClassName: 'aos-init', // class applied after initialization
    animatedClassName: 'aos-animate', // class applied on animation
    useClassNames: false, // if true, will add content of `data-aos` as classes on scroll
    disableMutationObserver: false, // disables automatic mutations' detections (advanced)
    debounceDelay: 50, // the delay on debounce used while resizing window (advanced)
    throttleDelay: 99, // the delay on throttle used while scrolling the page (advanced)


    // Settings that can be overridden on per-element basis, by `data-aos-*` attributes:
    offset: 0, // offset (in px) from the original trigger point
    delay: 0, // values from 0 to 3000, with step 50ms
    duration: 400, // values from 0 to 3000, with step 50ms
    easing: 'ease', // default easing for AOS animations
    once: false, // whether animation should happen only once - while scrolling down
    mirror: true, // whether elements should animate out while scrolling past them
    anchorPlacement: 'top-bottom', // defines which position of the element regarding to window should trigger the animation

});

$(document).ready(function () {
    furiendFinder.init();
    // Initializing AOS
    AOS.init();
    
})