
console.log("in popup.js");

// Provided a referenced to a callback function, finds the URL of the
// current tab and routes it to the callback function.
function getCurrentUrl(callback)
{
	chrome.runtime.sendMessage({func: "get_url"},function(response)
	{
		callback(String(response.data));
	});
}

function getHttpXml(url)
{
	var xml_http = new XMLHttpRequest();
	xml_http.open("GET",url,false);
	xml_http.send(null);
	return xml_http.responseText;
}

function fetchWebArchiveRecent(url){
    let built_url="https://archive.org/wayback/available?url="+url;
    return getHttpXml(built_url);
}

function fetchWebArchiveDatetime(url,datetime){
    console.log("in fetchWebArchiveDatetime, date=",datetime," url=",url);
    let timestamp=datetime.split('-')[0]+datetime.split('-')[1]+datetime.split('-')[2];
    let built_url="https://archive.org/wayback/available?url="+url+"&timestamp="+timestamp;
    return getHttpXml(built_url);
}

function fetchWebArchiveAll(url){
    console.log("in fetchWebArchiveAll, url=",url);
    let built_url="https://web.archive.org/cdx/search/cdx?url="+url;
    let data=getHttpXml(built_url);
    console.log("just finished inside fetchWebArchiveAll");
    return data;
}

function buildFrame(){
    let frame_container=document.createElement("div");
    frame_container.id="chromos_container";
    frame_container.style.boxShadow="0px 2px 4px rgba(0,0,0,0.4)";
    frame_container.style.height="40%";
    frame_container.style.top="40px";
    frame_container.style.zIndex="9999999";
    frame_container.style.position="fixed";
    frame_container.style.width="95%";
    frame_container.style.left="2.5%";
    frame_container.style.background="rgba(256,256,256,0.95)";
    frame_container.style.transition="2s all";
    document.body.appendChild(frame_container);    
    return frame_container;
}

function buildFrameTitle(url){
    let frame_title=document.createElement("p");
    frame_title.textContent="WebArchive results for \'"+(url.length<80 ? url : url.slice(0,79)+"...")+"\'";
    frame_title.style.fontFamily="\'Roboto\', sans-serif";
    frame_title.style.fontSize="16px";
    frame_title.style.margin="10px";
    frame_title.style.marginBottom="20px";
    return frame_title;
}

function parseTimestamp(timestamp){
    let the_date=new Date();
    the_date.setYear(timestamp.slice(0,4));
    the_date.setMonth(parseInt(timestamp.slice(4,6)-1));
    the_date.setDate(parseInt(timestamp.slice(6,8)-1));
    the_date.setHours(parseInt(timestamp.slice(8,10)-1));
    the_date.setMinutes(parseInt(timestamp.slice(10,12)-1));
    the_date.setSeconds(parseInt(timestamp.slice(12,14)-1));
    return the_date;
}

function buildMostRecentLink(url,element){
    let archived_items=fetchWebArchiveRecent(url);
    console.log(archived_items);
    let json_data=JSON.parse(archived_items);
    let recent_datetime=parseTimestamp(json_data.archived_snapshots.closest.timestamp);
    element.textContent=recent_datetime.toLocaleString();
    element.href=json_data.archived_snapshots.closest.url;
}

// callback for getCurrentUrl
function processUrl(url)
{
    let frame_container=buildFrame(); 
    let frame_title=buildFrameTitle(url);
    frame_container.appendChild(frame_title);

    let loading_label=document.createElement("p");
    loading_label.textContent="Loading content from WebArchive...";
    loading_label.style.fontFamily="Consolas";
    loading_label.style.margin="10px";
    frame_container.appendChild(loading_label);

    //let archived_items=fetchWebArchiveRecent(url);
    //let json_data=JSON.parse(archived_items);
    //console.log(json_data);

    loading_label.style.display="none";

    let frame_head=document.createElement("head");
    frame_container.appendChild(frame_head);

    let roboto_font_import=document.createElement("link");
    roboto_font_import.href="https://fonts.googleapis.com/css?family=Roboto"
    roboto_font_import.rel="stylesheet";
    frame_head.appendChild(roboto_font_import);

    let jquery_import=document.createElement("script");
    jquery_import.src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js";
    jquery_import.type="text/javascript";
    frame_head.appendChild(jquery_import);

    let frame_logo_link=document.createElement("a");
    let frame_logo=document.createElement("img");
    frame_logo.src="https://artsweb.uwaterloo.ca/archivesunleashed/wp-content/uploads/sites/19/2015/10/1024px-Internet_Archive_logo_and_wordmark-300x300.png";
    frame_logo.style.position="absolute";
    frame_logo.style.bottom="0px";
    frame_logo.style.right="0px";
    frame_logo.style.height="40px";
    frame_logo.style.width="40px";
    frame_logo.style.margin="10px";
    frame_logo_link.href="https://archive.org/";
    frame_logo_link.target="_blank";
    frame_logo_link.appendChild(frame_logo);
    frame_container.appendChild(frame_logo_link);

    let archive_link_span=document.createElement("span");
    archive_link_span.style.marginTop="10px";
    archive_link_span.style.marginLeft="10px";
    archive_link_span.style.fontFamily="Roboto, sans-serif";
    archive_link_span.style.fontSize="12px";

    let archive_link_label=document.createElement("p");
    archive_link_label.textContent="Most Recent Snapshot";
    archive_link_label.style.display="inline";
    
    let archive_link=document.createElement("a");
    archive_link.textContent="Loading data from WebArchive...";
    archive_link.target="_blank";
    archive_link.style.display="inline";
    archive_link.style.marginLeft="10px";

    setTimeout(buildMostRecentLink(url,archive_link),0);
    
    archive_link_span.appendChild(archive_link_label);
    archive_link_span.appendChild(archive_link);
    frame_container.appendChild(archive_link_span);

    let close_button=document.createElement("button");
    close_button.textContent="Close";
    close_button.onclick=function(){
        frame_container.style.top="-150%";
    };
    close_button.style.border="none";
    close_button.style.boxShadow="0px 2px 4px rgba(0,0,0,0.4)";
    close_button.style.borderRadius="0px";
    close_button.style.position="absolute";
    close_button.style.left="0px";
    close_button.style.bottom="0px";
    close_button.style.margin="10px";
    frame_container.appendChild(close_button);

    let date_input_span=document.createElement("span");
    date_input_span.style.display="block";
    date_input_span.style.margin="10px";
    frame_container.appendChild(date_input_span);

    let date_label=document.createElement("p");
    date_label.textContent="Specify Date";
    date_label.style.display="inline";
    date_label.style.fontSize="12px";
    date_label.style.fontFamily="\'Roboto\', sans-serif";
    date_input_span.appendChild(date_label);

    let datepicker_input=document.createElement("input");
    datepicker_input.type="date";
    datepicker_input.id="datepicker_input";
    datepicker_input.style.margin="10px";
    datepicker_input.style.fontSize="12px";
    datepicker_input.style.border="none";
    datepicker_input.style.width="130px";
    date_input_span.appendChild(datepicker_input);


    let date_search_results_label=document.createElement("p");
    date_search_results_label.style.display="inline";
    date_search_results_label.textContent="- Closest Snapshot: ";
    let date_search_results_link=document.createElement("a");

    let date_search_results_span=document.createElement("span");
    date_search_results_link.style.display="inline";
    date_search_results_link.style.marginLeft="10px";
    date_search_results_link.target="_blank";
    date_search_results_span.style.display="none";
    date_search_results_span.style.marginLeft="10px";
    date_search_results_span.appendChild(date_search_results_label);
    date_search_results_span.appendChild(date_search_results_link); 
    frame_container.appendChild(date_search_results_span);

    let date_search=document.createElement("button");
    date_search.innerText="Search";
    date_search.onclick=function(){
        
        let picked_day=datepicker_input.value.split("-")[2];
        let picked_month=datepicker_input.value.split("-")[1];
        let picked_year=datepicker_input.value.split("-")[0];

        if (datepicker_input.value.length<1){
            datepicker_input.style.border="2px solid red";
            setTimeout(function(){
                datepicker_input.style.border="none";
            },2000);
            return;
        }

        try{
            parseInt(picked_year);
            parseInt(picked_month);
            parseInt(picked_day);
        } catch(err){
            datepicker_input.style.border="2px solid red";
            setTimeout(function(){
                datepicker_input.style.border="none";
            },2000);
            return;
        }
        let date_results=fetchWebArchiveDatetime(url,datepicker_input.value);
        date_results=JSON.parse(date_results);
        console.log(date_results);

        date_search_results_link.href=date_results.archived_snapshots.closest.url;
        date_search_results_link.textContent=parseTimestamp(date_results.archived_snapshots.closest.timestamp).toLocaleString();

        date_search_results_span.style.display="block";
    }
    date_search.style.border="none";
    date_search.style.boxShadow="0px 2px 4px rgba(0,0,0,0.4)";
    date_input_span.appendChild(date_search);


    console.log("before fetching all");
    //setTimeout(fetchWebArchiveAll(url),0);
    console.log("after fetching all");

}

// Call getCurrentUrl function with the processUrl function being called
// after getCurrentUrl has called callback. The value provided to callback
// by getCurrentUrl will be routed as the input to processUrl
getCurrentUrl(processUrl);