
function LOADDATA() {
    var resetBtn = document.getElementById("reload");
    resetBtn.disabled = "disabled";
    fetch("/refresh", {
        method: 'POST'

    }).then(response => {
        return response.json()

    }).then(function (data) {
        // `data` is the parsed version of the JSON returned from the above endpoint.
        
        console.log(data);
        var buttonGroup = document.getElementById("buttonGroup")
        tilesCollection= []
        buttonGroup.textContent = '';
        functionResponses = 0
        getData()
        getReadingData()
        getHistoricData()


        for (let i = 1; i < 10; i++) {
            setTimeout(function timer() {
                if (functionResponses == 3) {
                    functionResponses = 4
                    
                    addFunction()
                    resetBtn.removeAttribute("disabled")
                }
            }, i * 1000);
        }


    })

}

function getData() {
    fetch("/static/data/heating.json").then(response => {
        if (!response.ok) {
            throw new Error("HTTP error " + response.status); // Rejects the promise
        }
        else { return response.json() }
    }).then(function (data) {
        // `data` is the parsed version of the JSON returned from the above endpoint.
        console.log(data);  // { "userId": 1, "id": 1, "title": "...", "body": "..." }
        refreshHeatingVisuals(data)

    });

}

function getHistoricData() {
    fetch("/static/history/tempHistory.json").then(response => {
        if (!response.ok) {
            throw new Error("HTTP error " + response.status); // Rejects the promise
        }
        else { return response.json() }
    }).then(function (data) {
        // `data` is the parsed version of the JSON returned from the above endpoint.
        console.log(data);  // { "userId": 1, "id": 1, "title": "...", "body": "..." }
        refreshTemperatureHistory(data)

    });

}


function getReadingData() {
    fetch("/static/data/readings.json").then(response => {
        if (!response.ok) {
            throw new Error("HTTP error " + response.status); // Rejects the promise
        }
        else { return response.json() }
    }).then(function (data) {
        // `data` is the parsed version of the JSON returned from the above endpoint.
        console.log(data);  // { "userId": 1, "id": 1, "title": "...", "body": "..." }
        refreshMeterVisuals(data)

    });

}

//Chart Section
var reportDataSets = []
var reportDataSetsCost = []
var reportDataSetsTemperature = []
var reportDataSetsTemperatureReg = []
var reportDataSetsCallForHeat = []
var labels = []
var tempLabels = []
var chartColours = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#3366cc", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac", "#b77322", "#16d620", "#b91383", "#f4359e", "#9c5935", "#a9c413", "#2a778d", "#668d1c", "#bea413", "#0c5922", "#743411"]
var tilesCollection = []
var functionResponses


function showReportData(x) {

    const chartLabels = labels
    const data = {
        labels: chartLabels,
        datasets: reportDataSets
    };
    console.log(reportDataSets, reportDataSetsCost, reportDataSetsTemperature)
    if (x == "myChart2") { data.datasets = reportDataSetsCost }
    if (x == "myChart3") { data.datasets = reportDataSetsTemperature;  }
    if (x == "myChart4") { data.datasets = reportDataSetsTemperatureReg;}
    if (x == "myChart5") { data.datasets = reportDataSetsCallForHeat;}
    
    const plugin = {
        id: 'custom_canvas_background_color',
        beforeDraw: (chart) => {
            const { ctx } = chart;
            ctx.save();
            ctx.globalCompositeOperation = 'destination-over';
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, chart.width, chart.height);
            ctx.restore();
        }
    };
    const config = {
        type: 'line',
        data: data,
        plugins: [plugin],
        options: {}//{"plugins":{"legend":{"maxHeight":10}}}
    };

    if (x == "myChart3" || x=="myChart4" || x=="myChart5") { config.options = { maintainAspectRatio: false } }
       // if (x=="myChart4"){config.type = "scatter"}
    const myChart = new Chart(
        document.getElementById(x),
        config
    );
    


}


function refreshTemperatureHistory(data) {

    //var buttonGroup = document.getElementById("buttonGroup")

    //    console.log(buttonGroup)

    //Temperature TILE

    tempDiv = document.createElement('div')
    tempDiv.setAttribute("data-role", "tile")
    tempDiv.setAttribute("data-size", "large")
    tempDiv.setAttribute("class", "bg-green col-1 row-9")
    //Branding Bar
    innerContent = document.createElement('canvas')
    innerContent.setAttribute("id", "myChart3")
    innerContent.setAttribute("style", "padding:5%")
    tempDiv.appendChild(innerContent)

    tilesCollection.push(tempDiv)

    //Regression Tile
    tempDiv = document.createElement('div')
    tempDiv.setAttribute("data-role", "tile")
    tempDiv.setAttribute("data-size", "large")
    tempDiv.setAttribute("class", "bg-green col-1 row-5")
    //Branding Bar
    innerContent = document.createElement('canvas')
    innerContent.setAttribute("id", "myChart4")
    innerContent.setAttribute("style", "padding:5%")
    tempDiv.appendChild(innerContent)

    tilesCollection.push(tempDiv)

    //Call for Heat Tile

    tempDiv = document.createElement('div')
    tempDiv.setAttribute("data-role", "tile")
    tempDiv.setAttribute("data-size", "large")
    tempDiv.setAttribute("class", "bg-green col-5 row-5")
    //Branding Bar
    innerContent = document.createElement('canvas')
    innerContent.setAttribute("id", "myChart5")
    innerContent.setAttribute("style", "padding:5%")
    tempDiv.appendChild(innerContent)

    tilesCollection.push(tempDiv)
    //buttonGroup.appendChild(tempDiv)

    console.log(data)
    console.log(Object.keys(data))
    reportDataSetsTemperature = []
    reportDataSetsCallForHeat = []
    reportDataSetsTemperatureReg = []
    //Temperature Data
    Object.keys(data).forEach(function (x, index) {
        console.log(data[x].sort(function(a,b){if (a.date < b.date){return -1}}))
        var tempData3 = {
            dataset: {
                "label": data[x][0].name,
                "backgroundColor": chartColours[index + 4],
                "borderColor": chartColours[index + 4],
                "data": data[x].sort(function (a, b) { return a.date - b.date }).map(function (y) { return { "x": y.date, "y": y.min } })
            }

        }

        
        console.log(tempData3)
        reportDataSetsTemperature.push(tempData3.dataset)
    })
    //Call For Heat Data
    Object.keys(data).forEach(function (x, index) {
        console.log(data[x].sort(function(a,b){if (a.date < b.date){return -1}}))
        var tempData3 = {
            dataset: {
                "label": data[x][0].name,
                "backgroundColor": chartColours[index + 4],
                "borderColor": chartColours[index + 4],
                "data": data[x].sort(function (a, b) { return a.date - b.date }).map(function (y) { return { "x": y.date, "y": y.total } })
            }

        }

        
        console.log(tempData3)
        reportDataSetsCallForHeat.push(tempData3.dataset)
    })

    var tempData4 = {
        dataset: {
            "label": "Temperature",
            "backgroundColor": chartColours[10],
            "borderColor": chartColours[10],
            "data": data[1].sort(function(a,b){if (a.date < b.date){return -1}}).map(function (y) { return { "x": y.date, "y": y.average } })
        }
    }

    function getAllDaysInMonth() {
        const today = new Date()
        const date = new Date(today.getFullYear(), today.getMonth(), 1);
        console.log(today, date)
        var tempDates = [];
      
        while (date.getMonth() === today.getMonth() && date <= today) {
          tempDates.push(new Date(date));
          date.setDate(date.getDate() + 1);
         
        }
        tempDates = tempDates.sort(function (a, b) { if (a < b) return -1 })
          .map(function (x) {
            console.log(x,)
            if ((x.getMonth()+1)==(today.getMonth()+1)){
            return x.getFullYear() + "-" + String(x.getMonth()+1).padStart(2, "0") + "-" + String(x.getDate()).padStart(2, "0")
            }
          })

        allDates = tempDates
        console.log(allDates)
        return allDates;
      }
      
    tempLabels = getAllDaysInMonth()
    console.log(tempLabels)
    labels = tempLabels
    reportDataSetsTemperature.push(tempData4.dataset)
    reportDataSetsTemperatureReg.push(tempData4.dataset)

    functionResponses = functionResponses + 1

}

function refreshHeatingVisuals(data) {

    var buttonGroup = document.getElementById("buttonGroup")

    console.log(buttonGroup)

    zonesArray = data[0]
    weatherData = data[1]

    zonesArray.forEach(function (x) {

        tempDiv = document.createElement('div')
        tempDiv.id = x.id
        tempDiv.setAttribute("data-role", "tile")
        tempDiv.setAttribute("data-size", "medium")
        //Branding Bar
        innerDiv = document.createElement('span')
        innerDiv.setAttribute("class", "branding-bar")
        innerDiv.setAttribute("style", "font-size:1.4rem")
        innerDiv.innerHTML = x.name
        //Icon Content
        innerContent = document.createElement('div')
        innerContent.setAttribute("class", "tile-content")
        htmlContent = []
        if (x.dataSection && x.type != "HOT_WATER") {
            htmlContent.push("Tar/Act: " + x.dataSection.targetTemp + "/" + x.dataSection.currentTemp)

            htmlContent.push("Power: " + x.dataSection.power)
            htmlContent.push("Humidity: " + x.dataSection.humidity)
            htmlContent.push("Min: " + x.histSection.min + " Max " + x.histSection.max)
            htmlContent.push("Heating Time: " + x.histSection.total)

            if (x.dataSection.currentTemp > x.dataSection.targetTemp) { tempDiv.setAttribute("class", "bg-pink") } else { tempDiv.setAttribute("class", "bg-orange") }
            if (x.dataSection.power > 0) {
                tempDiv.setAttribute("class", "bg-orange")
                badgeBrand = document.createElement('div')
                badgeBrand.setAttribute("class", "brand")
                badge = document.createElement('div')
                badge.setAttribute("class", "badge busy")
                badge.innerHTML = "H"
                badgeBrand.appendChild(badge)
                tempDiv.appendChild(badgeBrand)
            }

        }
        else if (x.dataSection && x.type == "HOT_WATER") {
            htmlContent.push('<font size="+2">' + x.dataSection.hwSetting + '</font>')

            if (x.dataSection.hwSetting == "OFF") { tempDiv.setAttribute("class", "bg-blue") } else { tempDiv.setAttribute("class", "bg-red") }

        }
        innerContent.innerHTML = htmlContent.join("<br>")

        //Append

        tempDiv.appendChild(innerDiv)
        tempDiv.appendChild(innerContent)
        tilesCollection.push(tempDiv)
    })

    //Weather Tile
    tempDiv = document.createElement('div')
    tempDiv.setAttribute("data-role", "tile")
    tempDiv.setAttribute("data-size", "medium")
    tempDiv.setAttribute("class", "col-1 row-2")



    //Branding Bar
    innerDiv = document.createElement('span')
    innerDiv.setAttribute("class", "branding-bar")
    innerDiv.setAttribute("style", "font-size:1.4rem")
    innerDiv.innerHTML = "Weather"
    //Icon Content
    innerContent = document.createElement('div')
    innerContent.setAttribute("class", "tile-content")
    htmlContent = []
    htmlContent.push("Outside: " + weatherData.temp)
    htmlContent.push(weatherData.weather.replace("_", " "))
    tempDiv.setAttribute("class", "bg-amber col-1 row-1")

    innerContent.innerHTML = htmlContent.join("<br>")
    tempDiv.appendChild(innerDiv)
    tempDiv.appendChild(innerContent)
    tilesCollection.push(tempDiv)
    

    //CHART TILE

    tempDiv = document.createElement('div')
    tempDiv.setAttribute("data-role", "tile")
    tempDiv.setAttribute("data-size", "wide")
    tempDiv.setAttribute("class", "bg-green")
    //Branding Bar
    innerContent = document.createElement('canvas')
    innerContent.setAttribute("id", "myChart")
    innerContent.setAttribute("style", "padding:5%")
    tempDiv.appendChild(innerContent)
    tilesCollection.push(tempDiv)

    //CHART TILE 2
    tempDiv = document.createElement('div')
    tempDiv.setAttribute("data-role", "tile")
    tempDiv.setAttribute("data-size", "wide")
    tempDiv.setAttribute("class", "bg-green")
    //Branding Bar
    innerContent = document.createElement('canvas')
    innerContent.setAttribute("id", "myChart2")
    innerContent.setAttribute("style", "padding:5%")
    tempDiv.appendChild(innerContent)
    tilesCollection.push(tempDiv)



    functionResponses = functionResponses + 1


}

function refreshMeterVisuals(data) {
    reportDataSets = []
    reportDataSetsCost = []

    tiles = data
    //tiles = [gas, electricity, total]

    tiles.forEach(function (x, index) {


        tempDiv = document.createElement('div')
        tempDiv.id = x.id
        tempDiv.setAttribute("data-role", "tile")
        tempDiv.setAttribute("data-size", "medium")
        //Branding Bar
        innerDiv = document.createElement('span')
        innerDiv.setAttribute("class", "branding-bar")
        innerDiv.setAttribute("style", "font-size:1.4rem")
        innerDiv.innerHTML = x.name
        //Icon Content
        innerContent = document.createElement('div')
        innerContent.setAttribute("class", "tile-content")
        htmlContent = []
        if (x.id != "BUDGET") {
            htmlContent.push("Cost: " + (Math.floor(x.cost) / 100) + "£")
            htmlContent.push("Amount: " + Math.round(x.consumption * 100) / 100 + "KWH")
            htmlContent.push("Month Cost: " + (Math.floor(x.monthCost) / 100) + "£")
            htmlContent.push("Month Amount: " + Math.round(x.monthConsumption * 100) / 100 + "KWH")
        }
        else if (x.id == "BUDGET") {
            htmlContent.push("Usage: " + (Math.floor(x.cost) / 100) + "£")
            htmlContent.push("Budget: " + (Math.floor(x.budget) / 100) + "£")
            htmlContent.push("Month Usage: " + (Math.floor(x.monthCost) / 100) + "£")
            htmlContent.push("Month Budget: " + (Math.floor(x.monthBudget) / 100) + "£")
            if (x.cost > (x.budget / 2)) { tempDiv.setAttribute("class", "bg-orange") }
            else if (x.cost > (x.budget)) { tempDiv.setAttribute("class", "bg-red") }
            else { tempDiv.setAttribute("class", "bg-green") }

        }



        innerContent.innerHTML = htmlContent.join("<br>")

        //Append

        tempDiv.appendChild(innerDiv)
        tempDiv.appendChild(innerContent)

        tilesCollection.push(tempDiv)

        //Chart Data
        if (x.id != "BUDGET") {

            var tempData = {
                "labels": x.detailConsumption.map(function (x) {
                    date = new Date(0)
                    date.setUTCSeconds(x[0])

                    return date.toISOString().split("T")[0]
                }),
                dataset: {
                    "label": x.name,
                    "backgroundColor": chartColours[index],
                    "borderColor": chartColours[index],
                    "data": x.detailConsumption.map(function (x) { return x[1] })
                }
            }

            var tempData2 = {
                "labels": x.detailCost.map(function (x) {
                    date = new Date(0)
                    date.setUTCSeconds(x[0])

                    return date.toISOString().split("T")[0]
                }),
                dataset: {
                    "label": x.name + " Cost",
                    "backgroundColor": chartColours[index + 2],
                    "borderColor": chartColours[index + 2],
                    "data": x.detailCost.map(function (x) { return x[1] / 100 })
                }

            }
            //tempData.labels.shift()
            //labels = tempData.labels
            reportDataSets.push(tempData.dataset)
            reportDataSetsCost.push(tempData2.dataset)

            if (x.name == "Gas") {
                var tempData6 =
                {
                    "dataset": {
                        "label": x.name + " Cost",
                        "backgroundColor": chartColours[index + 2],
                        "borderColor": chartColours[index + 2],
                        "data": x.detailCost.map(function (x) { 
                            date = new Date(0)
                            date.setUTCSeconds(x[0])
                            
                            
                            return {"x":date.toISOString().split("T")[0],"y":x[1] / 100 }})
                    }
                }
                reportDataSetsTemperatureReg.push(tempData6.dataset)
            }
            

        }


    })
    functionResponses = functionResponses + 1

}


function maximiseTile(x) {
    if (document.defaultView.getComputedStyle(x, null).getPropertyValue("z-index") == 99) {
        x.removeAttribute("style")
        var container = document.getElementById("maximiseWindow")
        container.setAttribute("style","position:absolute;z-index:-999;width:100vw;height:100vh")
        var buttonGroup = document.getElementById("buttonGroup")
        buttonGroup.appendChild(x)
        buttonGroup.removeAttribute("style")
        var fullMenuBar = document.getElementById("fullMenuBar")
        fullMenuBar.removeAttribute("style")
        var reload = document.getElementById("reload")
        reload.setAttribute("style","position: absolute;right: 1%;top: 1%; z-index: 9999;")

    }
    else {
        console.log(window.innerHeight,window.innerWidth)
        var buttonGroup = document.getElementById("buttonGroup")
        buttonGroup.setAttribute("style","display:none")
        var fullMenuBar = document.getElementById("fullMenuBar")
        fullMenuBar.setAttribute("style","display:none")
        var reload = document.getElementById("reload")
        reload.setAttribute("style","display:none")
        var style = "position:absolute;z-index:99;height:"+window.innerHeight+"px;width:"+window.innerWidth+"px"
        console.log(style)
        var container = document.getElementById("maximiseWindow")
        container.setAttribute("style","position:absolute;z-index:98;width:100vw;height:100vh")
        container.appendChild(x)
        x.setAttribute("style", style) }
}

function addFunction() {

    reportDataSets.forEach(x => { x.hidden = false })
    reportDataSetsCost.forEach(x => { x.hidden = false })
    reportDataSetsTemperature.forEach(x => { x.hidden = false })
    reportDataSetsTemperatureReg.forEach(x => { x.hidden = false })
    reportDataSetsCallForHeat.forEach(x => { x.hidden = false })

    console.log(JSON.stringify(reportDataSetsTemperatureReg))

    console.log(tilesCollection)

    tilesCollection.forEach(function (x) {
        var buttonGroup = document.getElementById("buttonGroup")
        console.log(x)
        buttonGroup.appendChild(x)

    })


    showReportData("myChart")
    showReportData("myChart2")
    showReportData("myChart3")
   // calculateCorrelation(reportDataSetsTemperatureReg)
    showReportData("myChart4")
    showReportData("myChart5")

    let elements = (() => {
        let aa = document.querySelectorAll('*')
        let bb = []
        aa.forEach(function (el) {
            //console.log(el)
            if (el.getAttribute('data-role')) {
                // console.log(el)
                bb.push(el)
                el.addEventListener("click", function (x) { maximiseTile(el) })
            }
        })
        return bb
    })();

}





