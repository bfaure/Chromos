
console.log("in popup.js");

// Provided a referenced to a callback function, finds the URL of the
// current tab and routes it to the callback function.
function get_url(callback)
{
	chrome.runtime.sendMessage({func: "get_url"},function(response)
	{
		callback(String(response.data));
	});
}

function get_http_xml(url)
{
	var xml_http = new XMLHttpRequest();
	xml_http.open("GET",url,false);
	xml_http.send(null);
	return xml_http.responseText;
}

function get_webarchive_urls(url){
    let built_url="https://archive.org/wayback/available?url="+url;
    return get_http_xml(built_url);
}


// callback for get_url
function process_url(url)
{
    console.log(url);
    
    console.log("asking WebArchive for data...");
    let archived_items=get_webarchive_urls(url);
    console.log(archived_items);

    let json_data=JSON.parse(archived_items);
    console.log(json_data);

    let iframe_container=document.createElement("div");
    iframe_container.id="chromos_container";
    iframe_container.style.boxShadow="0px 2px 4px rgba(0,0,0,0.4)";
    iframe_container.style.height="22%";
    iframe_container.style.top="40px";
    iframe_container.style.zIndex="9999999";
    iframe_container.style.position="fixed";
    iframe_container.style.width="95%";
    iframe_container.style.left="2.5%";
    iframe_container.style.background="rgba(256,256,256,0.95)";
    iframe_container.style.transition="2s all";



    let frame_title=document.createElement("p");
    frame_title.textContent="WebArchive for \'"+url+"\'";
    frame_title.style.fontFamily="roboto";
    frame_title.style.fontSize="16px";
    frame_title.style.margin="10px";

    iframe_container.appendChild(frame_title);
    //iframe_container.innerHTML="<p>WebArchive</p>";

    //iframe_container.innerHTML+="<p>this is another test</p>";

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
    //iframe_container.appendChild(frame_logo);
    frame_logo_link.appendChild(frame_logo);
    iframe_container.appendChild(frame_logo_link);

    let archive_link=document.createElement("a");
    archive_link.href=json_data.archived_snapshots.closest.url;
    archive_link.textContent=json_data.archived_snapshots.closest.url;
    archive_link.target="_blank";
    iframe_container.appendChild(archive_link);


    let close_button=document.createElement("button");
    close_button.textContent="Close";
    close_button.onclick=function(){
        iframe_container.style.top="-400px";
    };
    close_button.style.border="none";
    close_button.style.boxShadow="0px 2px 4px rgba(0,0,0,0.4)";
    close_button.style.borderRadius="0px";
    close_button.style.position="absolute";
    close_button.style.left="0px";
    close_button.style.bottom="0px";
    close_button.style.margin="10px";
    iframe_container.appendChild(close_button);


    document.body.appendChild(iframe_container);    

}

// Call get_url function with the process_url function being called
// after get_url has called callback. The value provided to callback
// by get_url will be routed as the input to process_url
get_url(process_url);