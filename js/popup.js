
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

function getWebArchiveRecent(url){
    let built_url="https://archive.org/wayback/available?url="+url;
    return getHttpXml(built_url);
}

function getWebArchiveDatetime(url,datetime){
    console.log("in getWebArchiveDatetime, date=",datetime," url=",url);
    return;
    let built_url="https://archive.org/wayback/available?url="+url+"&timestamp="+datetime 
    return getHttpXml(built_url);
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
    frame_title.textContent="WebArchive results for \'"+url+"\'";
    frame_title.style.fontFamily="\'Roboto\', sans-serif";
    frame_title.style.fontSize="16px";
    frame_title.style.margin="10px";
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

// callback for getCurrentUrl
function processUrl(url)
{
    let archived_items=getWebArchiveRecent(url);
    let json_data=JSON.parse(archived_items);
    console.log(json_data);

    let frame_container=buildFrame(); 
    let frame_title=buildFrameTitle(url);
    frame_container.appendChild(frame_title);

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

    /*
    let jquery_ui_import=document.createElement("script");
    jquery_ui_import.src="https://code.jquery.com/ui/1.10.3/jquery-ui.js";
    jquery_ui_import.type="text/javascript";
    frame_head.appendChild(jquery_ui_import);
    */

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

    let recent_datetime=parseTimestamp(json_data.archived_snapshots.closest.timestamp);

    let archive_link=document.createElement("a");
    archive_link.style.margin="10px";
    archive_link.href=json_data.archived_snapshots.closest.url;
    archive_link.textContent="Most Recent Snapshot ("+recent_datetime.toLocaleString()+")";
    archive_link.target="_blank";
    frame_container.appendChild(archive_link);

    let close_button=document.createElement("button");
    close_button.textContent="Close";
    close_button.onclick=function(){
        frame_container.style.top="-400px";
    };
    close_button.style.border="none";
    close_button.style.boxShadow="0px 2px 4px rgba(0,0,0,0.4)";
    close_button.style.borderRadius="0px";
    close_button.style.position="absolute";
    close_button.style.left="0px";
    close_button.style.bottom="0px";
    close_button.style.margin="10px";
    frame_container.appendChild(close_button);

    let date_label=document.createElement("p");
    date_label.textContent="Specify Date";
    date_label.style.display="block";
    date_label.style.margin="10px";
    date_label.style.fontSize="12px";
    date_label.style.fontFamily="\'Roboto\', sans-serif";
    frame_container.appendChild(date_label);

    let datepicker_input=document.createElement("input");
    datepicker_input.type="date";
    datepicker_input.style.display="block";
    datepicker_input.style.margin="10px";
    datepicker_input.style.fontSize="12px";
    datepicker_input.style.fontFamily="\'Roboto\', sans-serif";
    frame_container.appendChild(datepicker_input);

    let date_search=document.createElement("button");
    date_search.innerText="Search";
    date_search.onclick=function(){
        console.log("here");
        console.log(url);
        console.log(datepicker_input);
        console.log(datepicker_input.textContent);
        console.log(datepicker_input.innerText);
        //return getWebArchiveDatetime(url,datepicker_input);
    }
    frame_container.appendChild(date_search);


}

// Call getCurrentUrl function with the processUrl function being called
// after getCurrentUrl has called callback. The value provided to callback
// by getCurrentUrl will be routed as the input to processUrl
getCurrentUrl(processUrl);