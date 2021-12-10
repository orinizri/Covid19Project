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
            backgroundColor:'rgba(255, 99, 132, 0.5)' ,
            borderColor:
                'rgba(255, 99, 132, 1)'
                // 'rgba(54, 162, 235, 1)',
                // 'rgba(255, 206, 86, 1)',
                // 'rgba(75, 192, 192, 1)',
                // 'rgba(153, 102, 255, 1)',
                // 'rgba(255, 159, 64, 1)',
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
                    display	: 'auto'
                }
            },
            x: {
                beginAtZero: true,
                display: 'auto',
                grid: {
                    display	: 'auto',
                    color : "lightgray",

                }
            },
        }
    }
});

// calculated: {death_rate: 4.643301788812984, recovery_rate: 79.68507086228139, recovered_vs_death_ratio: null, cases_per_million_population: 1124}
// confirmed: 155019
// critical: 24294
// deaths: 7198
// recovered: 123527
const continents = document.querySelector(".continents");
const continentsButtons = document.querySelectorAll(".continents button");
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
    let data = await (await fetch(`https://intense-mesa-62220.herokuapp.com/https://corona-api.com/countries/${countryCode}`)).json()
    // console.log(data.data)
    // console.log(countriesOfContinent.length)
    // console.log(data)
    return {
        name : data.data.name,
        code : data.data.code,
        confirmed: data.data.latest_data.confirmed, 
        critical : data.data.latest_data.critical,
        death : data.data.latest_data.death,
        recovered: data.data.latest_data.recovered,
        confirmedToday: data.data.today.confirmed,
        deathToday: data.data.today.deathToday,
    }
}

// getCoronaByCountryCode("AF")
function getCoronaByContinent(countriesOfContinent) {
    countriesPromises = [];
    countriesOfContinent.forEach((countryInContinent) => {
        countriesPromises.push(getCoronaByCountryCode(countryInContinent.code))
    });
    return prepareDataToChart(countriesPromises);
}
// Data and Labels are pushed when continent and data type are selected
async function prepareDataToChart(preparedCountriesData, dataType='none') {
    // console.log(preparedCountriesData)
    Promise.all(preparedCountriesData).then((CountriesArray) =>{
        console.log(CountriesArray)
        if (dataType !== 'none') {
            myChart.data.datasets[0].data = [];
            myChart.data.datasets[0].label = `Number of ${dataType[0].toUpperCase()}${dataType.slice(1)} Cases Per Country`;
            myChart.data.labels = [];
            CountriesArray.forEach(country => {
                if (country) {
                    countriesData.push(country)
                    myChart.data.datasets[0].data.push(country[dataType])
                    myChart.data.labels.push(country.name)
                }
            })
            myChart.update();
        }
    })
}


async function getRegion(continent) {
    countriesOfContinent = []
    let data = await (await fetch(`https://intense-mesa-62220.herokuapp.com/https://restcountries.herokuapp.com/api/v1/region/${continent}`)).json()
    data.forEach(country => {
        
        countriesOfContinent.push({
            name: country.name.common,
            code: country.cca2,
        })
    });
    
    addCountriesOfContinent(countriesOfContinent)
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
continentsButtons.forEach(button => {
    button.addEventListener("click", (e) => {
        console.dir(dataTypeNav)
        if (dataTypeNav.dataset.see === "display-none") {
            console.log(e)
            console.log(e.target.dataset)

            e.target.dataset.chosen = true;
            dataTypeNav.dataset.see = "display"
        } else {
            asideCountries.innerHTML = ''
            console.log(e)
            for (let button of continentsButtons) {
                button.dataset.chosen = false;
            }
            for (let button of continentsDataTypeButtons) {
                button.dataset.chosen = false;
            }
            e.path[0].dataset.chosen = true;
            console.log("you already chose")
            console.log(button)
            console.log(e.target)
            mainContent.dataset.see = "display-none";
        }
        getRegion(button.classList.value)
        
    })
});

continentsDataTypeButtons.forEach(button => {
    button.addEventListener("click", (e) => {
        if (mainContent.dataset.see === "display-none") {
            console.log(mainContent)
            console.dir(e.target)
            e.target.dataset["chosen"] = true;
            mainContent.dataset.see = "display"
        } else {
            for (let button of continentsDataTypeButtons) {
                button.dataset.chosen = false;
            }
            e.target.dataset["chosen"] = true;

        }
        prepareDataToChart(countriesPromises,e.target.className)
    })
})

sideBarCountries.addEventListener("mouseover", (e) => {
    console.dir(e.path[0].textContent)
    let countryInfo = countriesData.filter( (country) => {
        return (country.name ==  e.path[0].textContent)
    })
    console.log(countryInfo)
})