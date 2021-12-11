const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            barPercentage: 1,
            barThickness: 10,
            maxBarThickness: 15,
            minBarLength: 2,
            label: '',
            data: [],
            backgroundColor: 'rgba(255, 99, 132, 0.5)',
            borderColor:
                'rgba(252, 27, 76, 0.5)'
            ,
            borderWidth: 1,
            color: 'rgba(255,255,255,1)',
        }]
    },
    options: {
        scales: {
            xAxes: [{
                ticks: {
                    fontSize: 9,
                    autoSkip: false,
                    fontColor: "white",
                    weight: 100,
                }
            }],
            yAxes: [{
                ticks: {
                    fontSize: 12,
                    autoSkip: true,
                    fontColor: "white",
                    weight: 100,
                }
            }],
            y: {
                beginAtZero: true,
                display: 'auto',
                grid: {
                    display: 'auto'
                }
            },
            x: {
                beginAtZero: true,
                display: 'auto',
                grid: {
                    display: 'auto',
                    color: "lightgray",

                }
            },
        }
    }
});


const continents = document.querySelector(".continents");
const continentsButtons = document.querySelectorAll(".continents button");
const continentsContainers = document.querySelectorAll(".countinent-container");
const continentsDataTypeButtons = document.querySelectorAll(".continent-data-type button");
const asideCountries = document.querySelector(".countries-of-continent");
const mainContent = document.querySelector("main")
const sideBarCountries = document.querySelector("aside");


let countriesOfContinent = [];
let countriesPromises = [];
let countriesData = [];

async function getCoronaByCountryCode(countryCode) {
    if (countryCode === 'XK') {
        return;
    }
    let data = await (await fetch(`https://intense-mesa-62220.herokuapp.com/https://corona-api.com/countries/${countryCode}`)).json();

    return {
        name: data.data.name,
        code: data.data.code,
        confirmed: data.data.latest_data.confirmed,
        critical: data.data.latest_data.critical,
        death: data.data.latest_data.deaths,
        recovered: data.data.latest_data.recovered,
        confirmedToday: data.data.today.confirmed,
        deathToday: data.data.today.deathToday,
    }
}

// getCoronaByCountryCode("AF")

const loaderContainerDiv = document.createElement("div");
const loaderDiv = document.createElement("div");


function getCoronaByContinent(countriesOfContinent) {
    loaderDiv.classList.add("loader");
    loaderContainerDiv.classList.add("loader-container");
    loaderContainerDiv.appendChild(loaderDiv);
    mainContent.appendChild(loaderContainerDiv);
    countriesPromises = [];
    countriesOfContinent.forEach((countryInContinent) => {
        countriesPromises.push(getCoronaByCountryCode(countryInContinent.code));
    });
    return prepareDataToChart(countriesPromises);
}
// Data and Labels are pushed when continent and data type are selected
async function prepareDataToChart(preparedCountriesData, dataType = 'none') {
    Promise.all(preparedCountriesData).then((CountriesArray) => {
        loaderDiv.classList.remove("loader");
        if (dataType !== 'none') {
            myChart.data.datasets[0].data = [];
            myChart.data.datasets[0].label = `Number of ${dataType[0].toUpperCase()}${dataType.slice(1)} Cases Per Country`;
            myChart.data.labels = [];
            CountriesArray.forEach(country => {
                if (country) {
                    countriesData.push(country);
                    myChart.data.datasets[0].data.push(country[dataType]);
                    myChart.data.labels.push(country.name);
                }
            })
            myChart.update();
        }
    })
}


async function getRegion(continent) {
    countriesOfContinent = [];
    let data = await (await fetch(`https://intense-mesa-62220.herokuapp.com/https://restcountries.herokuapp.com/api/v1/region/${continent}`)).json()
    data.forEach(country => {
        countriesOfContinent.push({
            name: country.name.common,
            code: country.cca2,
        })
    });
    addCountriesOfContinent(countriesOfContinent);
    return getCoronaByContinent(countriesOfContinent);
}
async function addCountriesOfContinent(countriesOfContinentArray) {
    asideCountries.innerHTML = ''
    const listOfCountries = document.createElement('ul');
    for (let i = 0; i < countriesOfContinentArray.length; i++) {
        if (countriesOfContinentArray[i].name !== "Kosovo") {
            listOfCountries.innerHTML += `<li>${countriesOfContinentArray[i].name}</li>`
        }
    }
    asideCountries.appendChild(listOfCountries);
}

const dataTypeNav = document.querySelector(".continent-data-type")
continentsContainers.forEach(container => {
    container.addEventListener("click", (e) => {
        console.dir(dataTypeNav)
        if (dataTypeNav.dataset.see === "display-none") {
            console.dir(e.target)
            e.target.dataset.chosen = true;
            dataTypeNav.dataset.see = "display";
        } else {
            asideCountries.innerHTML = '';
            for (let container of continentsContainers) {
                console.log(container.children[1])
                container.children[1].dataset.chosen = false;
            }
            for (let container of continentsDataTypeButtons) {
                console.log(container)
                container.dataset.chosen = false;
            }
            e.path[0].dataset.chosen = true;
            mainContent.dataset.see = "display-none";
        }
        console.log(container.classList[0])
        getRegion(container.classList[0])
    })
});

continentsDataTypeButtons.forEach(button => {
    button.addEventListener("click", (e) => {
        if (mainContent.dataset.see === "display-none") {
            e.target.dataset["chosen"] = true;
            mainContent.dataset.see = "display";
        } else {
            for (let button of continentsDataTypeButtons) {
                button.dataset.chosen = false;
            }
            e.target.dataset["chosen"] = true;

        }
        prepareDataToChart(countriesPromises, e.target.className);
    })
})
let InfoBox = document.createElement("div");
sideBarCountries.addEventListener("mouseover", (e) => {
    InfoBox.classList.remove("fade-out");
    InfoBox.innerHTML = '';
    console.dir(e.path[0].textContent);
    let countryInfo = countriesData.filter((country) => {
        return (country.name == e.path[0].textContent);
    })
    if (countryInfo.length > 0) {
        InfoBox.innerHTML += `<p>`;
        Object.entries(countryInfo[0]).forEach((element) => {
            if (!element[1]) {
                element[1] = "0";
            } 
            if (element[0].indexOf('confirmedToday') !== (-1)) {
                console.log("yay")
                element[0] = 'New Cases';
            } else if (element[0].indexOf('deathToday') !== (-1)) {
                element[0] = 'New Deaths';
            }
            InfoBox.innerHTML += `<span>${element[0][0].toUpperCase()}${element[0].slice(1)}</span>: ${element[1]}</br>`;
        })
        InfoBox.innerHTML += `</p>`;
        InfoBox.classList.add('country-info');
        mainContent.appendChild(InfoBox);
    } else {
        InfoBox.innerHTML += `<p>No Information</p>`;
    }
});

sideBarCountries.addEventListener("mouseout", (e) => {
    if (e.path[0].tagName === "LI") {
        mainContent.lastChild.classList.add("fade-out");     
    }
});