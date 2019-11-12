/*
Proyect: Weather
Date: November 2019
Objetive:
*/

// Declare global variables
var	gobForecast ;

var	gobDaysForecast = new Array();
var garrApi = {
	  "api_ipaddress"     : "https://api.ipify.org?format=json", 				// API to get IP adress
	  "api_location"   : "http://ip-api.com/json/", 							// API to get location user
	  "api_weather_alert"    : "https://api.weather.gov/alerts/active/area/" ,	// API to get alerts weather
	  "api_weather_forecast": "https://api.weather.gov/points/",				// API to get coordinates or position/ general
	  "api_forecast":"",														// API to get specific area with details
	  "api_forescast_state":"https://api.weather.gov/stations?state="
	};
var garrParameter = {
		"API"     : "",
		"ip"   : "", 					// IP address
		"city": "",						// City
		"country": "",					// Country of city
		"countryCode": "",				// Code of conutry
		"isp": "",						// Proveedor
		"lat": 0,						// Latitude
		"lon": 0,						// Longitude
		"org": "",						// Organitacion
		"query": "",					// Who made query
		"region": "",					// Region weather
		"regionName": "",				// Ragion Name
		"status": "",					// Status of weather
		"timezone": "",					// Time of zone
		"zip": "",						// Code Zip
		"type_query": "",				// Weather or Alarm
		"date_query":"",				// Date
		"async": true,					// Type of request
		"timeout":2000					// Time of of the request
};


//Class with metods and functions
var gObjectsClass = {
	_getHttpRequest : function  (parrParameter)
	{
			var lobReturn;
			try{

				var req = new XMLHttpRequest();
				var strURL ="";
				switch(parrParameter.API) {
					  case "api_ipaddress":
						garrParameter.async = false;
						strURL = garrApi.api_ipaddress ;
						break;
					  case "api_location":
						garrParameter.async = false;
						strURL = garrApi.api_location + parrParameter.ip;
						break;
					  case "api_weather_alert":
						strURL = garrApi.api_weather_alert + parrParameter.city;
						break;
					  case "api_weather_forecast":
						strURL = garrApi.api_weather_forecast + parrParameter.lat + "," + parrParameter.lon;
						break;
					  case "api_forescast_state":
					  	strURL = garrApi.api_forescast_state+ parrParameter.city;
						break;
					  case "api_forecast":
					  	strURL = garrApi.api_forecast;
						break;
					  default:
						return false;
				}

				req.ontimeout = function () {
					req.abort()
					showError("The request is timed out.");
				};

				/*req.onreadystatechange = function () { */
				req.onload = function() {
					if (req.readyState === 4) {
						if (req.status === 200) {
							// Create object with data
							var lobData = jQuery.parseJSON ( req.responseText );
							lobReturn =  lobData;
							if (lobData.constructor.keys(lobData)) fillData(lobData);
						} else {
							req.abort()
							console.error(req.statusText);
						}
					}
				};

				req.open('GET',strURL,garrParameter.async);
				if (parrParameter.async) req.timeout =  parrParameter.timeout;
				req.send(null);
				event.preventDefault();

			}catch( error)
			{
				showError(error);
				return false;
			}
			return lobReturn;

	},

	// Create array forescast
	_arrDaysforecast : function()
	{
			var obDate = new Date();

			// Day of week
			var week = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
			var arrWeek = new Array();
			for (var i=0; i<5;i++)
			{

				gobDaysForecast[i] = week[obDate.getDay()]+"|"+obDate.getUTCFullYear()+"-"+(obDate.getUTCMonth()+1)+"-"+((obDate.getDate()<10) ? '0' + obDate.getDate(): obDate.getDate());
				obDate.setDate(obDate.getDate() + 1);
			}

	},


	//Show days forcast
	_showDaysforecast : function ()
	{
		var obTagLi ;
		var obTagA
		var strText ;
		var obH1 ;
		var obHeading ;
		var container = document.getElementById("days_forecast");
		container.innerHTML = "";
		obH1 = document.createElement("h1");
		obH1.textContent = garrParameter.city + " - "+garrParameter.region;
		obHeading = document.getElementsByClassName("section-heading");
		obHeading[0].appendChild(obH1);

		for (var i=0; i<gobDaysForecast.length;i++)
		{
			// Create node type Element
			 obTagLi = document.createElement("li");
			 obTagA = document.createElement("a");
			 obTagA.setAttribute("href", "#"+gobDaysForecast[i].split("|")[0].toLowerCase() );
			 if (i==0) obTagA.setAttribute("class", "active");

			 obTagA.addEventListener("click",function() {
				var lobDays_forecast = document.getElementById("days_forecast").getElementsByTagName("a");

				 for (var i=0; i<lobDays_forecast.length;i++)
				 {
					if (lobDays_forecast[i].text.toLocaleLowerCase()==this.text.toLocaleLowerCase())
					{
					 	lobDays_forecast[i].setAttribute("class", "active");
					 	document.getElementById(this.text.toLocaleLowerCase()).setAttribute("style", "display: block");
					}else
					{
					 	lobDays_forecast[i].setAttribute("class", "");
					 	document.getElementById(lobDays_forecast[i].text.toLocaleLowerCase()).setAttribute("style", "display: none");
					}

				 }
        	});

			strText = document.createTextNode(gobDaysForecast[i].split("|")[0]);
			obTagA.appendChild(strText);
			obTagLi.appendChild(obTagA);
			container.appendChild(obTagLi);

		}

	},

	// Show details of advice forecast
	_showDetailsforecast : function ()
	{
		var obTagLi ;
		var obTagA
		var strText ;
		var container ;
		var strWeather_item="";
		var is_element_of_day= false;
		for (var i=0; i<gobDaysForecast.length;i++)
		{
			container = document.getElementById(gobDaysForecast[i].split("|")[0].toLowerCase());

			//loop for elements of weather
			for (var i_details=0; i_details<gobForecast.properties.periods.length; i_details++)
			{
				is_element_of_day = function ()
					{
						//look for th same date
						if (
							gobForecast.properties.periods[i_details].startTime.indexOf(gobDaysForecast[i].split("|")[1])>=0
							) return true;

						//look for the same day of week
						if (
							gobForecast.properties.periods[i_details].name.toLowerCase().indexOf(gobDaysForecast[i].toLowerCase())>=0
							) return true;
					}

				//Validation of date and day of week
				if (is_element_of_day())
				{
					strWeather_item += this._DetailHTML(gobForecast.properties.periods[i_details]);
				}

			}

			// create HTML with forcast day
			container.getElementsByClassName("row")[0].innerHTML = strWeather_item; strWeather_item="";


		}

	},

	//Create HTML
	_DetailHTML : function (parrData)
	{
		var iconWeather = function (desWeather)
		{

			if (desWeather.indexOf("snow",0)>=0)
			{
				return "weather-icon-04.png";
			}
			else if(desWeather.indexOf("sunny",0)>=0)
			{
				return "weather-icon-03.png";
			}
			else if(desWeather.indexOf("clear",0)>=0)
			{
				return "weather-icon-03.png";
			}
			else if(desWeather.indexOf("rain",0)>=0)
			{
				return "weather-icon-01.png";
			}
			else if(desWeather.indexOf("cloudy",0)>=0)
			{
				return "weather-icon-02.png";
			}
			else
			{
				return "weather-icon-03.png";
			}
		};

		return  		"					<div class='col-md-4-weather'>"+
                        "                            <div class='weather-item' >"+
                        "                                <h6 >"+((parrData.isDaytime) ? "Day":"Ningth")+"</h6>"+
                        "                                <div class='weather-icon'>"+
                        "                                    <img src='img/"+iconWeather(parrData.shortForecast.toLocaleLowerCase())+"' alt=''>"+
                        "                                </div>"+
                        "                                <span id=>"+parrData.temperature+"&deg;"+parrData.temperatureUnit+"</span>"+
                        "                                <ul class='time-weather'>"+
                        "                                    <li> Forecast<span  title='"+parrData.shortForecast+"'>"+(parrData.shortForecast.length>=15 ? parrData.shortForecast.substr(0,15)+"..":parrData.shortForecast)+"</span></li>"+
                        "                                    <li>Win direcction <span>"+parrData.windDirection+"</span></li>"+
                        "                                    <li>Wind speed<span>"+parrData.windSpeed+"</span></li>"+
                        "                                </ul>"+

                        "                            </div>"+
                        "                        </div>"+
                        "					</div>"+
						"";


  	}


};



// Setup page
var setup_page = function (){

//return ;
	var larrParameter = garrParameter;
	var lobData ;
	var days_forecast ;

	//var lObjectsClass = new gObjectsClass;
	//ip, get IP user
	larrParameter.API = garrApi.constructor.keys(garrApi)[0];
	lobData = gObjectsClass._getHttpRequest(larrParameter);

	//location API, get location user
	larrParameter.API = garrApi.constructor.keys(garrApi)[1];
	lobData = gObjectsClass._getHttpRequest(larrParameter);

	//forecast API, get
	larrParameter.API = garrApi.constructor.keys(garrApi)[3];
	lobData= gObjectsClass._getHttpRequest(larrParameter);

	//forecast_zone API
	larrParameter.API = garrApi.constructor.keys(garrApi)[4];
	garrApi.api_forecast= lobData.properties.forecast;
	gobForecast = gObjectsClass._getHttpRequest(larrParameter);

	//Create array with day for week
	gObjectsClass._arrDaysforecast();

	// show days
	gObjectsClass._showDaysforecast();

	// Show detail of weather
	gObjectsClass._showDetailsforecast();

}

function fillData(parrData)
{
	for (var i = 0; i <parrData.constructor.keys(parrData).length;i++)
	{
		garrParameter[parrData.constructor.keys(parrData)[i]] = parrData[parrData.constructor.keys(parrData)[i]];
	}

}

//Create Listeners
function createEventListeners(){

	showLoader (1);
	document.getElementById('form-submit').addEventListener('submit',requestData,false);
	document.getElementById('city').addEventListener('change',dataCity,false);
	document.getElementById('country').addEventListener('change',dataState,false);


	for (var i = 0; i < 3; i++) {
		obOption = document.getElementsByTagName("input")[i];
		obOption.checked = false;
		if (obOption.addEventListener) {
			obOption.addEventListener("click", verifyOption, false);
		} else if (obOption.attachEvent)  {
			obOption.attachEvent("click", verifyOption);
		}
	}

	setup_page();

	showLoader (0);

}


// Validate values in form
function validateForm()
{
	garrParameter.city = document.getElementById("city").value;
	garrParameter.country = document.getElementById("country").value;
	garrParameter.type_query = $('input[name=type_query]:checked').attr('value');;
	garrParameter.date_query = document.getElementById("from").value;;

	if ( garrParameter.city == ""  || garrParameter.country =="" || garrParameter.type_query == "" || garrParameter.date_query == "" )
	{
		window.alert("Please, complete data");
		return false;
	}

}

// Do request XML
function requestData( event ) {
		 try{
			 showLoader(1);
			var larrParameter = garrParameter;
			var lobData ;

			if (larrParameter.type_query == "weather")
			{


				//get ubication by state
				larrParameter.API = garrApi.constructor.keys(garrApi)[5];
				lobData = gObjectsClass._getHttpRequest(larrParameter);

				//get forecast by cordinates
				larrParameter.API = garrApi.constructor.keys(garrApi)[3];
				garrApi.lat= lobData.features[0].geometry.coordinates[0];
				garrApi.lon= lobData.features[0].geometry.coordinates[1];
				lobData = gObjectsClass._getHttpRequest(larrParameter);

				//get detail by zone
				larrParameter.API = garrApi.constructor.keys(garrApi)[4];
				garrApi.api_forecast= lobData.properties.forecast;
				gobForecast = gObjectsClass._getHttpRequest(larrParameter);

				// show days
				gObjectsClass._showDaysforecast();

				// Show detail of weather
				gObjectsClass._showDetailsforecast();

			}else {
				var objdivData = document.getElementById("preData");
				var obP = document.createElement("p");
				var texta="";

				//forecast_zone API
				larrParameter.API = garrApi.constructor.keys(garrApi)[2];
				gobForecast = gObjectsClass._getHttpRequest(larrParameter);

				for (var i=0; i<gobForecast.features.length;i++)
				{
texta= "<nav class='navbar navbar-expand-lg navbar-dark bg-dark' style='background-color: #2f679e52!important;'>";
texta+=""+
"<table width='90%' border=1>"+
"<tbody><tr>"+
"<td align='left' valign='top' class='headline'>"+gobForecast.features[i].properties.headline+"</td>"+
"<td align='right' valign='top' class='detail'>"+
"<span >Urgency: </span>"+gobForecast.features[i].properties.urgency+"<br><span >Status: </span>Actual</td>"+
"</tr>"+
"<tr><td colspan='2' class='area'>"+
"<span >Areas affected:</span>"+gobForecast.features[i].properties.areaDesc+"</td></tr>"+
"</tbody></table>";
texta+= "</nav>";
					obP.innerHTML = "";
					obP.innerHTML = gobForecast.features[i].properties.areaDesc;
					objdivData.innerHTML += texta;
texta=+"";
/*					gobForecast.features[i].properties.areaDesc;
					gobForecast.features[i].properties.description;
					gobForecast.features[i].properties.event;
					gobForecast.features[i].properties.headline
					gobForecast.features[i].properties.instruction
					gobForecast.features[i].properties.severity
					gobForecast.features[i].properties.urgency
					*/
				}
			}
			 showLoader(0);

		}catch( error)
		{
			showError(error);
			 showLoader(0);
		}

};


// Function to show data in page
function showData(lobdata)
{
	var objdivData = document.getElementById("preData");
	// Write result
	document.write("<div  > <input type='button' value='Main Page' onclick='location.reload()' style='font-family:Arial;font-size:10pt;width:200px;height:30px;background:#777777;color:#fff444;cursor:pointer;'/> <pre >"+lobdata+"<pre></div>  ");
	//objdivData.innerHTML(document.write( lobdata));
	showLoader(0);
	$("#divData").show();
	showLoader(0);
	window.alert("Finish");

}

// Function Errors
function showError(error)
{
	var objdivData = document.getElementById("preData");
	objdivData.innerHTML( document.write(error));
	showLoader(0);
	$("#divData").show();


}

//Show/Hide image loader
function showLoader(onOff)
{
	switch(onOff) {
	  case 0: // off
    	$(".loader").fadeOut("slow");
 		$('.loader').hide();
	    break;
	  case 1: //on
    	$(".loader").fadeIn("slow");
 		$('.loader').show();
	    break;
	  default: //default off
 		$('.loader').hide();
	}

}

$(document).on('click','a.tab_day', function(){ //
    	this.classList.value ="active";

});


$("#days_forecast").click(function (pObject) {


});


function dataCity(){
  // Validate City
}

function dataState(){
  // vlidate State
}

function verifyOption()
{
  // Validate Option
}

function showImage()
{
  // showImages
}


/* Create event listeners */
if (window.addEventListener) {
   window.addEventListener("load", createEventListeners, false);
} else if (window.attachEvent) {
   window.attachEvent("onload", createEventListeners);
}


