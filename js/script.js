$(document).ready(OnReady);

var solr_data = "";
var chart;
var audio;
var doc;

function OnReady(){
    //$("#search_box").submit(SolrOnSubmit);
	$("#refine_btn").click(MCOnSubmit);
	$("#refine_btn").click(createChart);
	

	$( "#search_box" ).submit(function( event ) {
		event.preventDefault();
		var search_val = encodeURIComponent($("#search").val());
		if(search_val.length > 0)
		{
			url_feel = 'http://192.168.1.78:8983/solr/mariemont/select?q=feeling%3A' + search_val + '%0A&wt=json&indent=true&_=1446939629337';
		}
		else
		{
			url_feel = 'http://192.168.1.78:8983/solr/mariemont/select?q=*%3A*&start=0&rows=10&wt=json&indent=true&_=1446941711578';
		}
		jQuery.ajax({
			url: url_feel,
			//data: 'q=titre:' + encodeURIComponent($("#search").val()) + '&wt=json&rows=20&indent=true',
			timeout: 2000,
			beforeSend: function() { console.log('b'); },
			complete: function() { console.log('a'); },
			success: SolrOnSuccess,
			error: SolrOnError,
			dataType: 'jsonp',
			jsonp: 'json.wrf'
		});
		return false;
	});
	
		$( ".search-path" ).click(function( event ) {
		event.preventDefault();
		jQuery.ajax({
			url: 'http://192.168.1.78:8983/solr/mariemont/select?q=' + $( this ).data('path') + ":1&start=0&rows=10&wt=json&indent=true&_=1446941711578",
			timeout: 2000,
			beforeSend: function() { console.log('b'); },
			complete: function() { console.log('a'); },
			success: SolrOnSuccess,
			error: SolrOnError,
			dataType: 'jsonp',
			jsonp: 'json.wrf'
		});
		return false;
	});
	
	$( ".search-feel" ).click(function( event ) {
		event.preventDefault();
		jQuery.ajax({
			url: 'http://192.168.1.78:8983/solr/mariemont/select?q=feeling:' + $( this ).data('feel') + "&start=0&rows=10&wt=json&indent=true&_=1446941711578",
			timeout: 2000,
			beforeSend: function() { console.log('b'); },
			complete: function() { console.log('a'); },
			success: SolrOnSuccess,
			error: SolrOnError,
			dataType: 'jsonp',
			jsonp: 'json.wrf'
		});
		return false;
	});
	
	$( "#list-results" ).on( "click", ".describe-pr", function(event) {
		event.preventDefault();
		jQuery.ajax({
			url: 'http://192.168.1.78:8983/solr/mariemont/select?q=id%3A' + $( this ).data('id') + '%0A&wt=json&indent=true&_=1446945726734',
			timeout: 2000,
			success: DisplayFormOnSuccess,
			error: SolrOnError,
			dataType: 'jsonp',
			jsonp: 'json.wrf'
		});
		return false;
	});
	
	$( "#section3" ).on( "submit", "#description-form", function(event) {
		event.preventDefault();
		var data_feeling =  $('input[name=synonym]').val();
		var data_id =  $('input[type=hidden]').val();
		   
		if (data_feeling.length > 0)
		{
			var updateQuery = "<add><doc><field name='id'>" + data_id + "</field><field name='feeling' update='add'> " + data_feeling + " </field></doc></add>";
			updateQuery = encodeURIComponent(updateQuery);

			
			jQuery.ajax({
				type: "GET",
				url: "http://192.168.1.78:8983/solr/mariemont/update?commit=true&stream.body=" + updateQuery,
				dataType: 'jsonp',
				jsonp: 'json.wrf',
				crossDomain: true, // CROSSDOMAIN TRUE
				timeout: 2000,
				success: ProductOnSuccess,
				error:  function(xhr, status, error) {
					if(arguments[0].status == '200'){
						jQuery.ajax({
							url: 'http://192.168.1.78:8983/solr/mariemont/select?q=id%3A' + data_id + '%0A&wt=json&indent=true&_=1446945726734',
							timeout: 2000,
							success: ProductOnSuccess,
							error: SolrOnError,
							dataType: 'jsonp',
							jsonp: 'json.wrf'
						});
					}
					else{
						// error
						console.log("Error when connecting to SolR:\tstatus: " + status + " | error: " + error + '| xhr' + xhr);
					}
				}
			});
		}
		else
		{
			jQuery.ajax({
				url: 'http://192.168.1.78:8983/solr/mariemont/select?q=id%3A' + data_id + '%0A&wt=json&indent=true&_=1446945726734',
				timeout: 2000,
				success: ProductOnSuccess,
				error: SolrOnError,
				dataType: 'jsonp',
				jsonp: 'json.wrf'
			});
		}

		return false;
	});
}

function DisplayFormOnSuccess(rsp){
	console.log(rsp.response.docs);
	console.log( rsp.response.docs[0] );
	var html = '<p class="text-center">Remplisez ici votre ressenti</p>';
	html += '<br>';
	html += '<div class="row">';
		html += '<form id="description-form" class="text-center">';
			html += '<div class="col-sm-12"><div class="row form-group"><div class="col-sm-6 col-sm-offset-3">';
				html += '<input type="text" id="middleName" name="synonym" class="form-control">';
				html += '<input type="hidden" value="' +  rsp.response.docs[0].id + '">';
				html += '<input type="submit" value="Ajouter" class="btn btn-default btn-lg pull-right"></form>';
			html += '</div></div></div>';
	html += '</div>';
	html += '<br>';
	
	html += '<div class="row">';
        html += '<div class="col-xs-4 col-xs-offset-1"><img width="444" height="222" class="img-responsive thumbnail center-block" src="' + rsp.response.docs[0].url_image + '"></div>';
        html += '<div class="col-xs-4"><img width="444" height="222" class="img-responsive thumbnail center-block" src="http://www.la.utexas.edu/users/bump/images/feelings/images/words1-1.png"></div>';
        html += '<div class="col-xs-4 text-right"><img width="444" height="222" class="img-responsive thumbnail center-block" src="' + rsp.response.docs[0].url_map + '"></div>';
    html += '</div>';
	html += '</div>';

	
	$("#list-one-form").html("");
	$("#list-one-form").html(html);
	
	$("#section5").hide();
	$("#section3").show();
	
	document.getElementById("search_box").reset();
	
}

function ProductOnSuccess(rsp){
	//<h3 class="text-center lato slideInUp animate">That <strong>Doesn't</strong> Have to Look Like Bootstrap.</h3>
	//<br>
	//<div class="row">
	//    <div class="col-xs-4 col-xs-offset-1">Some brand-tacular designs even have home page content that is taller that 12,000 pixels. That's a lotta content.</div>
	//    <div class="col-xs-2"></div>
	//    <div class="col-xs-4 text-right">Anyhoo, this is just some random blurb of text, and Bootply.com is a playground and code editor for Bootstrap.</div>
	//</div>
	//<br>
	//<p class="text-center">
	//    <img src="//placehold.it/444x222/444/FFF" class="img-responsive thumbnail center-block ">
	//</p>
	
	console.log( rsp.response.docs[0] );

	var html = '';//'<h3 class="text-center lato slideInUp animate">' + rsp.response.docs[0].titre + '</h3>';
	html += '<br>';
	html += '<div class="row">';
		html += '<div class="col-xs-10 text-right"><img width="444" height="222" class="img-responsive thumbnail center-block" src="' + rsp.response.docs[0].url_map + '"></div>';
	html += '</div>';
	html += '<div class="row">';
		html += '<div class="col-xs-5 text-right"><img width="444" height="222" class="img-responsive thumbnail center-block" src="' + rsp.response.docs[0].url_image + '"></div>';
		html += '<div class="col-xs-5 text-right">'; 
			if(typeof rsp.response.docs[0].titre !== "undefined")
			{
				html += '<p class="text-left"><strong>titre:</strong> ' + rsp.response.docs[0].titre + '</p>';
			}
			if(typeof rsp.response.docs[0].matiere !== "undefined")
			{
				html += '<p class="text-left"><strong>matiere:</strong> ' + rsp.response.docs[0].matiere + '</p>';
			}
			if(typeof rsp.response.docs[0].date !== "undefined")
			{
				html += '<p class="text-left"><strong>date:</strong> ' + rsp.response.docs[0].date + '</p>';
			}
			if(typeof rsp.response.docs[0].lieu !== "undefined")
			{
				html += '<p class="text-left"><strong>lieu:</strong> ' + rsp.response.docs[0].lieu + '</p>';
			}
			if(typeof rsp.response.docs[0].inventaire !== "undefined")
			{
				html += '<p class="text-left"><strong>inventaire:</strong> ' + rsp.response.docs[0].inventaire + '</p>';
			}
			if(typeof rsp.response.docs[0].description !== "undefined")
			{
				html += '<p class="text-left"><strong>description:</strong> ' + rsp.response.docs[0].description + '</p>';
			}
			if(typeof rsp.response.docs[0].feeling !== "undefined")
			{
				html += '<p class="text-left"><strong>feeling:</strong> ' + rsp.response.docs[0].feeling + '</p>';
			}
		html += '</div>';
	html += '</div>';
	html += '<br>';
	html += '<p class="text-center"></p>';

	$("#list-one-result").html("");
	$("#list-one-result").html(html);
	
	$("#section3").hide();
	$("#section4").show();
	
	document.getElementById("search_box").reset();
	
}

function SolrOnSuccess(rsp){
	solr_data = "method=" + encodeURIComponent("MediaCycle t_Sne") + "&";
	solr_data = "grid=" + encodeURIComponent("Proximity Grid") + "&";
	var html = ''; //"La recherche de \"" + document.getElementById('search').value + "\" a fourni " + rsp.response.numFound + " résultats en " + rsp.responseHeader.QTime + " ms:\n\n";
	for (i = 0; i < rsp.response.docs.length; i++) { 
		//console.log(rsp.response.docs[i]);
		//<hr>
		//<div class="media">
		//	<h3>Boom</h3>
		//	<div class="media-left">
		//		<img src="//placehold.it/100">
		//	</div>
		//	<div class="media-body media-middle">
		//		<p>Some brand-tacular designs even have home page content that is taller that 12,000 pixels. That's a lotta content Lorem ipsum dolor sit amet, adipiscing elit.</p>
		//	</div>
		//</div>
		html += '<hr>';
		html += '<div class="media">';
			
			if(typeof rsp.response.docs[i].titre !== "undefined")
			{
			html += '<h3>' + rsp.response.docs[i].titre +  '</h3>';
			}
			html += '<div class="media-left"><a href="" class="describe-pr" data-id="'+ rsp.response.docs[i].id+'">';
				html += '<img width="100" height="100" src="' + rsp.response.docs[i].url_map + '">';
				//
			html += '</a></div>';
			html += '<div class="media-left"><a href="" class="describe-pr" data-id="'+ rsp.response.docs[i].id+'">';
				html += '<img width="100" height="100" src="' + rsp.response.docs[i].url_image + '">';
				//url_map
			html += '</a></div>';
			if(typeof rsp.response.docs[i].description !== "undefined")
			{
			html += '<div class="media-body media-middle"><p>' + rsp.response.docs[i].description.substring(0, 50) + '...</p></div>';
			}
		html += '</div>';
		solr_data += "url=" + encodeURIComponent(rsp.response.docs[i].titre) + "&";
	}
	$("#list-results").html("");
	$("#list-results").html(html);
	
	$("#recherche").hide();
	$("#section5").show();
	
	document.getElementById("search_box").reset();
}

function SolrOnError(xhr, status, error) {
	/**
	var html = "La recherche de \"" + document.getElementById('search').value + "\" a fourni " + rsp.response.numFound + " résultats en " + rsp.responseHeader.QTime + " ms:\n\n";
	$("#list-results").html("");
	$("#list-results").html(html);
	
	$("#recherche").hide();
	$("#section5").show();
	
	document.getElementById("search_box").reset();
	**/

	/**
	$("#recherche").hide();
	$("#section5").show();
	
	console.log("ERROR ARGUMENTS: \n")
	console.log(arguments);
	console.log("Error when connecting to SolR:\tstatus: " + status + " | error: " + error + '| xhr' + xhr);
	$("#result_solr").html("Error when connecting to SolR:\tstatus: " + status + " | error: " + error);
	document.getElementById("search_box").reset();
	**/
}

// Refine with Mediacycle
function MCOnSubmit(){
	jQuery.ajax({
		type: "POST",
		url: 'http://192.168.1.78:12345/select?',
		data: solr_data,
		timeout: 10000,
		success: MCOnSuccess,
		error: MCOnError,
		dataType: 'jsonp',
	});
    return false;
}

function MCOnSuccess(rsp){
	doc = [];
	if (rsp=="Update function requires at least the url param") {
		return;
	}
	var html= "Mediacycle a procédé à un reclassement par t_SNE: \n\n";// en " + rsp.responseHeader.QTime + " ms:\n\n";
	html += "Total time: " + rsp.responseHeader.queryTime + "ms\n";
	html += "Parsing time: " + rsp.responseHeader.parsingTime + "ms\n";
	html += "Loading files time: " + rsp.responseHeader.loadingTime + "ms\n";
	html += "Computing distances time: " + rsp.responseHeader.pluginTime + "ms\n";
// 	html += "Parameters: \n";
// 	for (i = 0; i < rsp.responseHeader.params.length; i++) {
// 		html += "\tName: " + rsp.responseHeader.params[i][0] + "\tValue: " + rsp.responseHeader.params[i][1] + "\n";
// 	}
	html += "\n";
	for (i = 0; i < rsp.docs.length; i++) { 
		html += "Doc " + i + ": " + rsp.docs[i].title + " and \tX: " + rsp.docs[i].x + " and \tY: " + rsp.docs[i].y + "\n";
	}
	$("#result_mc").html("");
	$("#result_mc").html(html);
	doc = rsp.docs;
	loadMCData(rsp);
}

// Search by title
function SolrOnSubmit(event){
	jQuery.ajax({
		url: 'http://192.168.1.78:8983/solr/mariemont/select?',
		data: 'q=title:' + encodeURIComponent($("#search").val()) + '&wt=json&rows=20&indent=true',
		timeout: 2000,
		success: SolrOnSuccess,
		error: SolrOnError,
		//beforeSend: function() { $('#spinner').show(); },
        //complete: function() { $('#spinner').hide(); },
		dataType: 'jsonp',
		jsonp: 'json.wrf'
	});
    return false;
}

function MCOnError(xhr, status, error) {
	console.log("ERROR ARGUMENTS: \n")
	console.log(arguments);
	$("#result_mc").html("Error when connecting to Mediacycle:\tstatus: " + status + " | error: " + error);
}

function createChart() {
	chart = c3.generate({
		bindto: '#result_mc_chart',
		data: {
			xs: {
				dataMC: 'dataMC_x',
			},
			columns: 	[["dataMC_x", 0],
						["dataMC", 0]],
			names: {
				dataMC: '',
			},
			type: 'scatter',
			colors: {
				dataMC: '#ff0000'
			},
			onmouseover: playSong,
			onmouseout: stopSong,
		},
		point: {
				r: 5
		},
		label: {
			show: false
		},
		padding: {
			right: 40,
			top: 40
		},
		tooltip: { 
			contents: displayLegend
		}
	});
}

function displayLegend(d, defaultTitleFormat, defaultValueFormat, color) {
	var v_str = doc[d[0].index].title.split("/");
	return v_str[v_str.length - 1];
}

function playSong(d){
	var v_str = doc[d.index].title.split("/");
	/*audio = new Audio(v_str[v_str.length - 2] + "/" + encodeURIComponent(v_str[v_str.length - 1]));*/
	audio = new Audio(doc[d.index].title);
	audio.addEventListener('loadedmetadata', function() {
		console.log("Playing " + audio.src + ", for: " + audio.duration + "seconds.");
		audio.play(); 
	});
}

function stopSong(d){
	audio.pause();
}

function showChart() {
	chart.show(['dataMC']);
}

function loadMCData(data) {
	var col = [];
	var nam = [];
	col[0] = [];
	col[1] = [];
	col[0][0] =  "dataMC_x";
	col[1][0] =  "dataMC";
	nam[0] = "dataMC_name";
	for (i = 0; i < data.docs.length; i++) { 
		col[0][i+1] = data.docs[i].x;
		col[1][i+1] = data.docs[i].y;
		nam[i+1] = data.docs[i].title;
	}
	chart.load({
		columns: col,
		names: nam
	});
}

function hideChart() {
    chart.hide(['dataMC']);
}









// // Search by hash
// function OnSubmit(){
// 	jQuery.ajax({
// 		url: 'http://localhost:8983/solr/mariemont/audioq?',
// 		data: 'title=*a*&wt=json&indent=true',
// 		timeout: 5000,
// 		success: OnSuccess,
// 		error: OnError,
// 		dataType: 'jsonp',
// 		jsonp: 'json.wrf'
// 	});
//     return false;
// }

