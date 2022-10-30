//--------------------------------Define GLobal Variables---------------------------------

var hotdata;
var changedata;
var global_data;
var change_data
var connectionData
var SDMZipFileName;
var hot;
var SelectedRuleIndex;
var SelectedVersionIndex;
var currentFile;
var paycodesResponse;
var ExportConfig;
var DataDictionary;
var ShiftSets;
var ZoneSets;
var OverrideHyperfind = ""
var OverrideStartDate = ""
var OverrideEndDate = ""
var OverridePassword = ""
var OverrideUsername = ""
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
		'body': JSON.stringify({ "username": "marcelmrottmann@gmail.com", "password": "Razorcat1911" })
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


			return
		});
}


function CREATETILESB(x) {
	

	
	console.log(buttonGroup)
	gas = {}
	electricity = {}

	budget = JSON.parse(require("static/settings/connections.json"))
	console.log(budget)
	total = { "budget": budget[0].budget,"monthBudget":budget[0].monthBudget, "cost": null,"monthCost": null, "id": "BUDGET", "name": "Budget" }
	zonesArrayB.forEach(function (x) {
		console.log(x)
		if (x.name == "gas cost") {
			gas.cost = x.dataSection.amount;
			total.cost = x.dataSection.amount;
			total.monthCost = x.histSection.amount
			gas.monthCost = x.histSection.amount
		}
		if (x.name == "gas consumption") {
			gas.consumption = x.dataSection.amount;
			gas.monthConsumption = x.histSection.amount;
			gas.id = x.resourceId
			gas.name = "Gas"
		}
		if (x.name == "electricity cost") {
			electricity.cost = x.dataSection.amount;
			electricity.monthCost = x.histSection.amount
			if (total.cost === null) { total.cost = x.dataSection.amount } else { total.cost = total.cost + x.dataSection.amount }
			if (total.monthCost === null) { total.monthCost = x.histSection.amount } else { total.monthCost = total.monthCost + x.histSection.amount }

		}
		if (x.name == "electricity consumption") {
			electricity.consumption = x.dataSection.amount;
			electricity.monthConsumption = x.histSection.amount;
			electricity.id = x.resourceId
			electricity.name = "Electricity"
		}
	})
	tiles = [gas, electricity, total]
	fs.writeFileSync("./history/readings.json",JSON.stringify(tiles))

	


}




function LOADDATA(){
	GETAUTH()
	GETAUTHB()
}

LOADDATA()

var intervalId = window.setInterval(function(){
	LOADDATA()
  }, 300000);