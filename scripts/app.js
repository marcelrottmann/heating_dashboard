//--------------------------------Define GLobal Variables---------------------------------
var accessToken
var homeId
var zonesArray = []

const fs = require("fs")
const request = require("request")
const rp = require("request-promise")

var history = []
var numberOfCallsTarget
var numberOfCallsActual


function GETAUTHC(x) {

	var options3 = {
		'method': 'POST',
		'url': 'https://auth.tado.com/oauth/token',
		'headers': {},
		formData: {
			'client_id': 'tado-web-app',
			'client_secret': 'wZaRN7rpjn3FoNyF5IFuxg9uMzYJcvOoQ8QWiIqS3hfk6gLhVlG57j5YNoZL2Rtc',
			'grant_type': 'password',
			'scope': 'home.user',
			'password': 'Razorcat1911',
			'username': 'marcelmrottmann@gmail.com'
		}
	};
	rp(options3)
		.then(function (parsedBody) {
			console.log(JSON.parse(parsedBody).access_token)
			accessToken = JSON.parse(parsedBody).access_token
			GETHOME(JSON.parse(parsedBody).access_token)
			

		})
		.catch(function (err) {
			console.log(err)

			return
		});
		return
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
			GETZONES(JSON.parse(parsedBody).homeId)
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
			fs.writeFileSync("./test.json",JSON.stringify(zonesArray))
			numberOfCallsTarget = 0
			numberOfCallsActual = 0
			history={}
			JSON.parse(parsedBody).forEach(function (x) {
				
				if (x.type != "HOT_WATER"){history[x.id]=[];GETHIST(x.id, x.dateCreated,x.name)}
			})

			
		})
		.catch(function (err) {
			console.log(err)

			return
		});
}
function GETHIST(x,createdDate,name) {


	dummyDate = new Date()
	month = dummyDate.getMonth()
 	year = dummyDate.getFullYear()
 	date = dummyDate.getDate()
  	startOfMonth = new Date(year, month, "1")
	today = new Date(year, month, date)

	numberOfCalls = Math.ceil(Math.abs(today - startOfMonth)/(24 * 60 * 60 * 1000)+1)

	calls = []
	for (let i = 0; i < numberOfCalls; i++) {
		
		nD = new Date(year, month, date)
		nD.setDate(nD.getDate() - (i))
		if (nD > new Date(createdDate)){
			console.log(nD)
		calls.push(nD.toISOString().substring(0,10))
		numberOfCallsTarget = numberOfCallsTarget+1
		}
	}
	console.log(fs.writeFileSync("./calls.json",JSON.stringify(calls)))
	calls.forEach(function (i) {

		var options3 = {
			'method': 'GET',
			'url': 'https://my.tado.com/api/v2/homes/' + homeId + "/zones/" + x + "/dayReport?date=" + i,
			'headers': { "Authorization": "Bearer " + accessToken },
			'resolveWithFullResponse': true
		};
		rp(options3)
			.then(function (parsedBody) {
				//fs.writeFileSync("./history" + x + ".json", parsedBody.body)

				zone = parsedBody.request.uri.path.split("/")[6]
				date = parsedBody.request.uri.path.split("?date=")[1]
				parsedBody = parsedBody.body
				//console.log(JSON.parse(parsedBody))
				
				x = JSON.parse(parsedBody)
				fs.writeFileSync("./history" + zone+"-"+date + ".json", JSON.stringify(x))
				y = {}
				y.zone = zone
				y.name = name
				y.date = date

				if (x.measuredData.insideTemperature.min) { y.min = x.measuredData.insideTemperature.min.celsius } else { y.min = "" }
				if (x.measuredData.insideTemperature.max) { y.max = x.measuredData.insideTemperature.max.celsius } else { y.max = "" }

				if (x.callForHeat.dataIntervals) {
					total = 0
					x.callForHeat.dataIntervals.forEach(function (x) {
						if (x.value != "NONE") {
							from = x.from
							to = x.to
							difference = Math.abs((new Date(from) - new Date(to)) / 3600000)
							total = total + difference
						}
					})
					y.total = total
					//console.log(total)
				}
				if (x.weather.condition.dataIntervals) {
					total = 0
					totalMinutes = 0
					x.weather.condition.dataIntervals.forEach(function (x) {
						if (x.value != "NONE") {
							if (x.value != null){
							total = total + x.value.temperature.celsius
							//console.log(total)
							}	
							
						}
					})
			
					y.average = total/x.weather.condition.dataIntervals.length
					console.log(y.average)
					numberOfCallsActual = numberOfCallsActual+1
					
					history[y.zone].push(y)
					if (numberOfCallsTarget == numberOfCallsActual){fs.writeFileSync("./../history/tempHistory.json",JSON.stringify(history))}
					
				}

			})
		.catch(function (err) {
			console.log(err)


			return
		});
	});
}


function GETBINS(x) {

	var options3 = {
		'method': 'GET',
		'url': 'https://api.reading.gov.uk/api/collections/310050532',
		'headers': {},
		'strictSSL': false
	};
	rp(options3)
		.then(function (parsedBody) {
			console.log(JSON.parse(parsedBody))
			fs.writeFileSync("./../history/binDays.json",JSON.stringify(parsedBody))
			return
		})
		.catch(function (err) {
			console.log(err)

			return
		});
		return
}




GETBINS()

setInterval(() => GETAUTHC(),60000)
GETAUTHC()
