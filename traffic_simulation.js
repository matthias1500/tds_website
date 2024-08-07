// == graphical parameters ==
let radius = 170;
let carHeight = 36;
let offsetLeft = 162;
let offsetTop = 182;
if (window.innerWidth <= 550) {
    radius = 140;
    carHeight = 31;
    offsetLeft = 137;
    offsetTop = 155;
}

// == simulation parameters ==
let timeResolution = 40;        // time resolution or refresh rate in Hz
let carLength = 0.45;           // length of a car in radiant (rad)
let maxAcceleration = 0.0002;

// internal computation values (from here on)
let simulationRunning = false;
let startColor = getComputedStyle(document.body).getPropertyValue("--start-color");
let stopColor = getComputedStyle(document.body).getPropertyValue("--stop-color");
const cars = document.getElementsByClassName("car-graphic");
let maxNumbCars = cars.length;
const carsInitialPosition = new Array(maxNumbCars).fill(null);
const carsLastPosition = new Array(maxNumbCars).fill(null);
const carsNewPosition = new Array(maxNumbCars).fill(null);
const carsNewPositionXY = new Array(maxNumbCars).fill(null);

let maxSpeedInput = document.getElementById("max-speed");
let maxSpeed = 0.01;
const speed = [0.001, 0.001, 0.001, 0.001, 0.001];
let minDistanceInput = document.getElementById("min-distance");
let minDistance = 0;
let suggestedDistance = 0;
let badDriver = false;

let interval = 1000 / timeResolution;
let counter = 0;
let mainInterval = 0;
let numberOfCars = 0;
let j = 0;
let infiniteCircleCorrection = 0;
let badDriverCounter = 0;

function nextCarPosition() {
    for (let i = 0; i < numberOfCars; i++) {
        if (i === 0 && badDriver) {
            badDriverCounter += 1;
            if (speed[0] > 0.006) {
                speed[0] = speed[0] - 0.001;
            } else if (badDriverCounter < 100) {
                speed[0] = 0.006;
            } else {
                badDriver = false;
                badDriverCounter = 0;
                document.getElementById("scenario-1").disabled = false;
            }
        } else if (i >= numberOfCars-1) {j = i + 1 - numberOfCars; infiniteCircleCorrection = Math.PI*2;} else {j = i + 1; infiniteCircleCorrection = 0;}
        suggestedDistance = minDistance * Math.PI/80;        // add dependence on maxSpeed
        let currentDistance = carsLastPosition[j] - carsLastPosition[i] + infiniteCircleCorrection;
        if (currentDistance < suggestedDistance) {
            speed[i] = (currentDistance - carLength) * maxSpeed / (suggestedDistance - carLength);
            if (speed[i] < 0) {
                speed[i] = 0;
            }
        } else if (speed[i] < maxSpeed) {
            speed[i] = speed[i] + maxAcceleration;
        } else {
            speed[i] = maxSpeed;
        }

        carsNewPosition[i] = speed[i] + carsLastPosition[i];
        carsNewPositionXY[i] = [radius * Math.sin(carsNewPosition[i]) + offsetLeft,
                                radius * -Math.cos(carsNewPosition[i]) + offsetTop];
        cars[i].style.left = String(carsNewPositionXY[i][0]) + "px";
        cars[i].style.top = String(carsNewPositionXY[i][1]) + "px";
        cars[i].style.transform = "rotate(" + String(carsNewPosition[i]) + "rad)";
        carsLastPosition[i] = carsNewPosition[i];
    }

    counter += 1;
    if (counter >= 3000){
        clearInterval(mainInterval);
        simulationRunning = true;
        startStopSimulation()
    }
}

function startStopSimulation() {
    if (simulationRunning === false) {
        simulationRunning = true;
        document.getElementById("start-stop-button").innerText = "Stop";
        document.getElementById("start-stop-button").style.backgroundColor = stopColor;
        document.getElementById("max-speed").disabled = true;
        document.getElementById("min-distance").disabled = true;
        document.getElementById("number-cars").disabled = true;
        counter = 1;
        maxSpeed = maxSpeedInput.value / 3000;
        minDistance = minDistanceInput.value;
        mainInterval = setInterval(nextCarPosition, interval);
    } else {
        clearInterval(mainInterval);
        for (let i = 0; i < numberOfCars; i++) {speed[i] = 0;}
        document.getElementById("start-stop-button").innerText = "Start";
        document.getElementById("start-stop-button").style.backgroundColor = startColor;
        document.getElementById("max-speed").disabled = false;
        document.getElementById("min-distance").disabled = false;
        document.getElementById("number-cars").disabled = false;
        simulationRunning = false;
    }
}

function resetSimulation() {
    counter = 0;
    for (let i = 0; i < numberOfCars; i++) {
        carsNewPositionXY[i] = [radius * Math.sin(carsInitialPosition[i]) + offsetLeft,
                                radius * -Math.cos(carsInitialPosition[i]) + offsetTop];
        cars[i].style.left = String(carsNewPositionXY[i][0]) + "px";
        cars[i].style.top = String(carsNewPositionXY[i][1]) + "px";
        cars[i].style.transform = "rotate(" + String(carsInitialPosition[i]) + "rad)";
        carsLastPosition[i] = carsInitialPosition[i];
    }
}

function setNumberOfCars() {
    numberOfCars = Number(document.getElementById("number-cars").value);
    for (let i = 0; i < numberOfCars; i++) {
        cars[i].height = carHeight;
        carsInitialPosition[i] = Math.PI * 2 / numberOfCars * i
    }
    for (let i = numberOfCars; i < cars.length; i++) {
        cars[i].height = "0";
    }
    resetSimulation()
}

document.getElementById("start-stop-button").addEventListener("click", startStopSimulation);
document.getElementById("reset-button").addEventListener("click", resetSimulation);
document.getElementById("scenario-1").addEventListener("click", () => {document.getElementById("scenario-1").disabled = true;
                                                                       badDriver = true;});

let maxSS = document.getElementById("max-speed");
maxSS.addEventListener("input", () => {document.getElementById("max-speed-value").innerText = String(maxSS.value);});
let minDS = document.getElementById("min-distance");
minDS.addEventListener("input", () => {document.getElementById("min-dist-value").innerText = String(minDS.value);});
let numbCS = document.getElementById("number-cars");
numbCS.addEventListener("input", () => {document.getElementById("numb-cars-value").innerText = String(numbCS.value);});
document.getElementById("number-cars").addEventListener("input", setNumberOfCars);


document.getElementById("max-speed-value").innerText = String(maxSS.value);
document.getElementById("min-dist-value").innerText = String(minDS.value);
document.getElementById("numb-cars-value").innerText = String(numbCS.value);
setNumberOfCars();
