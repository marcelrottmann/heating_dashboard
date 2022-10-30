const express = require('express')
const app = express()
const port = 3000

app.use('/static', express.static(__dirname))
app.use('/static/scripts', express.static(__dirname +"/scripts"))

app.get('/', (req, res) => {
res.sendFile(__dirname + '/index.html')
})

app.listen(port,()  => {
  console.log(`Example app listening on port ${port}`)
})

app.post('/refresh' , (req, res)=>{
console.log("Refreshing")
refreshed = false
ready = false
GETAUTHB()
GETAUTH()


for (let i = 1; i < 10; i++) {
  setTimeout(function timer() {
    if (ready == true && refreshed == false){
	refreshed = true	
	return res.send(200, { message: '{"status":"REFRESHING"}' })}
  }, i * 3000);
}



})



//--------------------------------Define GLobal Variables---------------------------------
var ready
var accessToken
var homeId
var dataArray = []
var zonesArray = []
var username = JSON.parse(fs.readFileSync("./settings/connections.json")).username
var password = JSON.parse(fs.readFileSync("./settings/connections.json")).password



const fs = require("fs")
var request = require ('request')
var rp = require('request-promise')
var weatherData



async function GETAUTH(x) {

	var options3 = {
		'method': 'POST',
		'url': 'https://auth.tado.com/oauth/token',
		'headers': {},
		formData: {
			'client_id': 'tado-web-app',
			'client_secret': 'wZaRN7rpjn3FoNyF5IFuxg9uMzYJcvOoQ8QWiIqS3hfk6gLhVlG57j5YNoZL2Rtc',
			'grant_type': 'password',
			'scope': 'home.user',
			'password': password,
			'username': username
		}
	};
	rp(options3)
		.then(function (parsedBody) {
			console.log(JSON.parse(parsedBody).access_token)
			accessToken = JSON.parse(parsedBody).access_token
			return GETHOME(JSON.parse(parsedBody).access_token)

		})
		.catch(function (err) {
			console.log(err)

			return
		});
}


function GETHOME(x) {

	var options3 = {
		'method': 'GET',
		'url': 'https://my.tado.com/api/v1/me',
		'headers': { "Authorization": "Bearer " + accessToken }
	};
	rp(options3)
		.then(function (parsedBody) {
			console.log(JSON.parse(parsedBody).homeId)
			homeId = JSON.parse(parsedBody).homeId
			return GETZONES(JSON.parse(parsedBody).homeId)
		})
		.catch(function (err) {
			console.log(err)

			return
		});
}


function GETZONES(x) {

	var options3 = {
		'method': 'GET',
		'url': 'https://my.tado.com/api/v2/homes/' + x + "/zones",
		'headers': { "Authorization": "Bearer " + accessToken }
	};
	rp(options3)
		.then(function (parsedBody) {
			console.log(JSON.parse(parsedBody))
			zonesArray = JSON.parse(parsedBody)

			JSON.parse(parsedBody).forEach(function (x) {
				GETDATA(x.id)
				return GETHIST(x.id)
			})

			GETWEATHER ()
		})
		.catch(function (err) {
			console.log(err)

			return
		});
}
function GETWEATHER(x) {

	var options3 = {
		'method': 'GET',
		'url': 'https://my.tado.com/api/v2/homes/' + homeId + "/weather",
		'headers': { "Authorization": "Bearer " + accessToken }
	};
	rp(options3)
		.then(function (parsedBody) {
			response = JSON.parse(parsedBody)
			console.log(response)
			weatherData = {}
			weatherData.temp = response.outsideTemperature.celsius
			weatherData.weather = response.weatherState.value

			console.log(weatherData)

		})
		.catch(function (err) {
			console.log(err)

			return
		});
}

function GETHIST(x) {

	today = new Date().toISOString().split("T")[0]

	var options3 = {
		'method': 'GET',
		'url': 'https://my.tado.com/api/v2/homes/' + homeId + "/zones/" + x + "/dayReport?date=" + today,
		'headers': { "Authorization": "Bearer " + accessToken },
		'resolveWithFullResponse': true
	};
	rp(options3)
		.then(function (parsedBody) {
			//fs.writeFileSync("./history" + x + ".json", parsedBody.body)

			zone = parsedBody.request.uri.path.split("/")[6]
			console.log(zone)

			parsedBody = parsedBody.body
			//console.log(JSON.parse(parsedBody))

			x = JSON.parse(parsedBody)
			y = {}
			y.zone = zone
			if (x.measuredData.insideTemperature.min) { y.min = x.measuredData.insideTemperature.min.celsius } else { y.min = "" }
			if (x.measuredData.insideTemperature.max) { y.max = x.measuredData.insideTemperature.max.celsius } else { y.max = "" }

			if (x.callForHeat.dataIntervals) {
				total = 0
				x.callForHeat.dataIntervals.forEach(function (x) {
					if (x.value != "NONE") {
						from = x.from
						to = x.to
						difference = Math.abs((new Date(from) - new Date(to)) / 3600000)
						total = total+difference
					}
				})
				total = total.toString().split(".")[0] 
				+ ":" 
				+String(Math.round(parseFloat("0." + total.toString().split(".")[1]) * 60)).padStart(2,"0")
			    y.total =  total
				console.log(total)
			}


			completeb = true
			zonesArray.forEach(function (z) { if (y.zone == z.id) { z.histSection = y } })
			zonesArray.forEach(function (z) {
				console.log(z.histSection,z.dataSection)
				if (z.dataSection && z.dataSection.zone != 0){
				if (!z.histSection) { completeb = false }
				if (!z.dataSection) { completeb = false }
				}
			})
			if (completeb == true) { return CREATETILES() }


		})
		.catch(function (err) {
			console.log(err)


			return
		});
}


function GETDATA(x) {

	var options3 = {
		'method': 'GET',
		'url': 'https://my.tado.com/api/v2/homes/' + homeId + "/zones/" + x + "/state",
		'headers': { "Authorization": "Bearer " + accessToken },
		'resolveWithFullResponse': true
	};
	rp(options3)
		.then(function (parsedBody) {
			//fs.writeFileSync("./response.json", JSON.stringify(parsedBody))

			zone = parsedBody.request.uri.path.split("/")[6]
			//console.log(zone)

			parsedBody = parsedBody.body
			//console.log(JSON.parse(parsedBody))

			x = JSON.parse(parsedBody)
			y = {}
			y.zone = zone

			if (x.setting.temperature) { y.targetTemp = x.setting.temperature.celsius } else { y.targetTemp = "" }
			if (x.sensorDataPoints.insideTemperature) { y.currentTemp = x.sensorDataPoints.insideTemperature.celsius } else { y.currentTemp = "" }
			if (x.activityDataPoints.heatingPower) { y.power = x.activityDataPoints.heatingPower.percentage } else { y.power = "" }
			if (x.sensorDataPoints.humidity) { y.humidity = x.sensorDataPoints.humidity.percentage } else { y.humidity = "" }
			if (x.openWindow == null) { y.openWindow = false } else { y.openWindow = true }
			if (x.setting) { y.hwSetting = x.setting.power }



			complete = true
			zonesArray.forEach(function (z) { if (y.zone == z.id) { z.dataSection = y } })
			zonesArray.forEach(function (z) {
				if (!z.histSection) { complete = false }
				if (!z.dataSection) { complete = false }
			})
			if (complete == true) { CREATETILES() }


		})
		.catch(function (err) {
			console.log(err)


			return
		});
}


function CREATETILES(x) {

	fs.writeFileSync("./history/"+new Date().toISOString().split("T")[0] +"heating.json",JSON.stringify([zonesArray,weatherData]))
	fs.writeFileSync("./data/heating.json",JSON.stringify([zonesArray,weatherData]))
	
	
}



var accessTokenB
var homeId
var dataArrayB = []
var zonesArrayB = []




function GETAUTHB(x) {

	var options3 = {
		'method': 'POST',
		'url': 'https://api.glowmarkt.com/api/v0-1/auth',
		'headers': {
			'Content-Type': 'application/json',
			'applicationId': ' b0f1b774-a586-4f72-9edd-27ead8aa7a8d'
		},
		'body': JSON.stringify({ "username": username, "password": password })
	};
	rp(options3)
		.then(function (parsedBody) {
			console.log(JSON.parse(parsedBody).token)
			accessTokenB = JSON.parse(parsedBody).token
			GETHOMEB(JSON.parse(parsedBody).token)

		})
		.catch(function (err) {
			console.log(err)

			return
		});
}


function GETHOMEB(x) {

	var options3 = {
		'method': 'GET',
		'url': ' https://api.glowmarkt.com/api/v0-1/virtualentity',
		'headers': {
			'Content-Type': 'application/json',
			'token': accessTokenB,
			'applicationId': 'b0f1b774-a586-4f72-9edd-27ead8aa7a8d'
		}
	};
	rp(options3)
		.then(function (parsedBody) {
			console.log(JSON.parse(parsedBody)[0].veId)
			homeId = JSON.parse(parsedBody)[0].veId
			GETZONESB(JSON.parse(parsedBody)[0].veId)
		})
		.catch(function (err) {
			console.log(err)

			return
		});
}


function GETZONESB(x) {

	var options3 = {
		'method': 'GET',
		'url': 'https://api.glowmarkt.com/api/v0-1/virtualentity/' + x + "/resources",
		'headers': {
			'Content-Type': 'application/json',
			'token': accessTokenB,
			'applicationId': 'b0f1b774-a586-4f72-9edd-27ead8aa7a8d'
		}
	};
	rp(options3)
		.then(function (parsedBody) {
			//console.log(JSON.parse(parsedBody))
			zonesArrayB = JSON.parse(parsedBody).resources
			JSON.parse(parsedBody).resources.forEach(function (x) {
				console.log(x.name)
				GETDATAB(x.resourceId)
				GETDATAC(x.resourceId)
			})


		})
		.catch(function (err) {
			console.log(err)

			return
		});
}

function GETDATAB(x) {

	startDate = new Date().toISOString().split("T")[0] + "T00:00:00"
	endDate = new Date().toISOString().split(".")[0]
	offset = "-60"
	period = "P1D"
	typeFunction = "sum"

	var options3 = {
		'method': 'GET',
		'url': 'https://api.glowmarkt.com/api/v0-1/resource/' + x + "/readings?" +
			"from=" + startDate + "&to=" + endDate + "&offset=" + offset + "&period=" + period + "&function=" + typeFunction,
		'headers': {
			'Content-Type': 'application/json',
			'token': accessTokenB,
			'applicationId': 'b0f1b774-a586-4f72-9edd-27ead8aa7a8d'
		},
		'resolveWithFullResponse': true
	};
	rp(options3)
		.then(function (parsedBody) {
			//fs.writeFileSync("./response.json", JSON.stringify(parsedBody))

			//console.log(zone)

			parsedBody = parsedBody.body
			//console.log(JSON.parse(parsedBody))

			x = JSON.parse(parsedBody)
			zone = x.resourceId
			console.log(x)
			y = {}
			y.zone = zone

			if (x.query) { y.startDate = x.query.from } else { y.startDate = "" }
			if (x.query) { y.endDate = x.query.to } else { y.endDate = "" }
			if (x.data) { y.amount = x.data[0][1] } else { y.amount = "" }
			complete = true
			zonesArrayB.forEach(function (z) { if (y.zone == z.resourceId) { z.dataSection = y } })
			zonesArrayB.forEach(function (z) {
				console.log(z.histSection,z.dataSection)

				if (!z.histSection) { complete = false }
				if (!z.dataSection && z.dataSection != undefined) { complete = false }
				
			})

			//fs.writeFileSync("./zonesArrayB.json", JSON.stringify(zonesArrayB))
			console.log(complete)
			if (complete == true) { CREATETILESB() }


		})
		.catch(function (err) {
			console.log(err)


			return
		});
}

function GETDATAC(x) {

	startDate = new Date().toISOString().split("T")[0].substring(0,8) + "01T00:00:00"
	endDate = new Date().toISOString().split(".")[0]
	offset = "-60"
	period = "P1D"
	typeFunction = "sum"

	var options3 = {
		'method': 'GET',
		'url': 'https://api.glowmarkt.com/api/v0-1/resource/' + x + "/readings?" +
			"from=" + startDate + "&to=" + endDate + "&offset=" + offset + "&period=" + period + "&function=" + typeFunction,
		'headers': {
			'Content-Type': 'application/json',
			'token': accessTokenB,
			'applicationId': 'b0f1b774-a586-4f72-9edd-27ead8aa7a8d'
		},
		'resolveWithFullResponse': true
	};
	rp(options3)
		.then(function (parsedBody) {
			//fs.writeFileSync("./response.json", JSON.stringify(parsedBody))

			//console.log(zone)

			parsedBody = parsedBody.body
			//console.log(JSON.parse(parsedBody))

			x = JSON.parse(parsedBody)
			zone = x.resourceId
			console.log(x)
			y = {}
			y.zone = zone

			if (x.query) { y.startDate = x.query.from } else { y.startDate = "" }
			if (x.query) { y.endDate = x.query.to } else { y.endDate = "" }
			if (x.data) {
			y.rawData = x.data
			totalAmount = 0
			x.data.forEach(function(y){
				totalAmount = totalAmount+y[1]
			})
			 y.amount = totalAmount } else { y.amount = "" }
			completeb = true
			zonesArrayB.forEach(function (z) { if (y.zone == z.resourceId) { z.histSection = y } })
			zonesArrayB.forEach(function (z) {
				//if (z.dataSection && z.dataSection.zone != 0){
				if (!z.histSection) { completeb = false }
				if (!z.dataSection) { completeb = false }
				//}
			})
			//fs.writeFileSync("./zonesArrayC.json", JSON.stringify(zonesArrayB))
			console.log(completeb)
			if (completeb == true) { CREATETILESB() }


		})
		.catch(function (err) {
			console.log(err)
			ready = false

			return
		});
}


function CREATETILESB(x) {
	


	gas = {}
	electricity = {}

	budget = JSON.parse(fs.readFileSync("./settings/connections.json"))
	console.log(budget)
	total = { "budget": budget[0].budget,"monthBudget":budget[0].monthBudget, "cost": null,"monthCost": null, "id": "BUDGET", "name": "Budget" }
	zonesArrayB.forEach(function (x) {
		console.log(x)
		if (x.name == "gas cost") {
			gas.cost = x.dataSection.amount;
			total.cost = x.dataSection.amount;
			total.monthCost = x.histSection.amount
			gas.monthCost = x.histSection.amount
			gas.detailCost = x.histSection.rawData
		}
		if (x.name == "gas consumption") {
			gas.consumption = x.dataSection.amount;
			gas.monthConsumption = x.histSection.amount;
			gas.id = x.resourceId
			gas.name = "Gas"
			gas.detailConsumption = x.histSection.rawData
		}
		if (x.name == "electricity cost") {
			electricity.cost = x.dataSection.amount;
			electricity.monthCost = x.histSection.amount
			if (total.cost === null) { total.cost = x.dataSection.amount } else { total.cost = total.cost + x.dataSection.amount }
			if (total.monthCost === null) { total.monthCost = x.histSection.amount } else { total.monthCost = total.monthCost + x.histSection.amount }
			electricity.detailCost = x.histSection.rawData

		}
		if (x.name == "electricity consumption") {
			electricity.consumption = x.dataSection.amount;
			electricity.monthConsumption = x.histSection.amount;
			electricity.id = x.resourceId
			electricity.name = "Electricity"
			electricity.detailConsumption = x.histSection.rawData
		}
	})
	tiles = [gas, electricity, total]
	fs.writeFileSync("./data/readings.json",JSON.stringify(tiles))
  fs.writeFileSync("./history/"+new Date().toISOString().split("T")[0] +"readings.json",JSON.stringify([tiles]))
	
	
	ready = true

}
