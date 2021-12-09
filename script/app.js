const ctx = document.getElementById('myChart').getContext('2d');
const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
        labels: [],
        datasets: [{
            label: '',
            data: [],
            backgroundColor: [
                // 'rgba(255, 99, 132, 0.2)',
                // 'rgba(54, 162, 235, 0.2)',
                // 'rgba(255, 206, 86, 0.2)',
                // 'rgba(75, 192, 192, 0.2)',
                // 'rgba(153, 102, 255, 0.2)',
                // 'rgba(255, 159, 64, 0.2)',
            ],
            borderColor: [
                // 'rgba(255, 99, 132, 1)',
                // 'rgba(54, 162, 235, 1)',
                // 'rgba(255, 206, 86, 1)',
                // 'rgba(75, 192, 192, 1)',
                // 'rgba(153, 102, 255, 1)',
                // 'rgba(255, 159, 64, 1)',
            ],
            borderWidth: 1
        }]
    },
    options: {
        scales: {
            y: {
                // beginAtZero: true,
                display: 'auto',
                grid: {
                    display	: 'auto'
                }
            },
            x: {
                // beginAtZero: true,
                display: 'auto',
                grid: {
                    display	: 'auto'
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


const countriesOfContinent = [];
const CountryCoronaData = []

async function getCoronaByCountryCode(countryCode) {
    let data = await (await fetch(`https://intense-mesa-62220.herokuapp.com/https://corona-api.com/countries/${countryCode}`)).json()
    // console.log(data.data)
    // console.log(countriesOfContinent.length)
    return {
        name : data.data.name,
        code : data.data.code,
        confirmed: data.data.latest_data.confirmed, 
        critical : data.data.latest_data.critical,
        deaths : data.data.latest_data.deaths,
        recovered: data.data.latest_data.recovered,
    }
}

// getCoronaByCountryCode("AF")
async function getCoronaByContinent(countriesOfContinent) {
    countriesOfContinent.forEach((countryInContinent) => {
        CountryCoronaData.push(getCoronaByCountryCode(countryInContinent.code))
    });
    return prepareContinentChartByChoice(CountryCoronaData);
}
async function prepareContinentChartByChoice(preparedCountriesData) {
    Promise.all(preparedCountriesData).then((CountriesArray) =>{
        console.log(CountriesArray)
        // console.log(myChart.data.datasets.data, myChart.data.datasets.label)
        // myChart.data.labels = [];
        // myChart.data.datasets.data = [];
        CountriesArray.forEach(country => {
            myChart.data.labels.push(country.name)
            // myChart.data.datasets.data.push()
        });
        myChart.update();
    } )
}

async function getRegion(continent) {
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
    console.log(countriesOfContinentArray)
    console.log(asideCountries)
    asideCountries.innerHTML = ''
    const listOfCountries = document.createElement('ul');
    for (let i = 0; i < countriesOfContinentArray.length; i++) {
        listOfCountries.innerHTML += `<li>${countriesOfContinentArray[i].name}</li>`;
    }
    console.log(listOfCountries)
    asideCountries.appendChild(listOfCountries);
}

continentsButtons.forEach(button => {
    button.addEventListener("click", () => {
        console.log("click")
        mainContent.classList.toggle("display-none")
        getRegion(button.classList.value)
        
    })
});

