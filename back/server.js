var childprocess = require('child_process');
var fs = require('fs');
var path = require('path');
var http = require('http');
var url = require('url');
var querystring = require('querystring');
//var ip = require('ip');	//remove -g
//express package could simplify below

const SQLConnectionInfo = require('./database-login.json');

const MimeContentType = {
	"html": "text/html;charset=utf-8",
	"ico" : "image/x-icon",
	"jpeg": "image/jpeg",
	"jpg": "image/jpeg",
	"png": "image/png",
	"js": "text/javascript",
	"json" : "application/json;charset=utf-8",
	"css": "text/css",
	"txt": "text/plain"
};

//console.log("Server Current Working Directory: ", process.cwd());
const DirectoryBackEnd = process.cwd() + "/back";
const DirectoryFrontEnd = process.cwd() + "/front";

var server = http.createServer(function (Request, Response) {
	
	try
	{
		Request.rawBody = '';
		Request.on('data', function( chunk ) {
			Request.rawBody += chunk;
		});
		
		//A local path
		const RequestedURL = url.parse(Request.url, true);
		
		var RequestedPage = RequestedURL.pathname;
		if (RequestedPage === '/')
		{
			RequestedPage = "/index.html";
		}

		const ContentType = MimeContentType[path.extname(RequestedPage).split(".")[1]];
		RequestedPage = path.join(DirectoryFrontEnd, RequestedPage);
		
		if (Request.method === "GET")
		{
			if (RequestedURL.pathname === "/retrieve")
			{
				let ProcessAccessDatabase = childprocess.fork(DirectoryBackEnd + '/fetch-record.js');
				ProcessAccessDatabase.send({SQLLogin : SQLConnectionInfo});
				
				ProcessAccessDatabase.on('message', function(Message) {
					
					Response.writeHead(200, { 'Content-Type': 'application/json' });
					Response.write( JSON.stringify( Message.FetchedRecords ) );
					Response.end();
				});
			}
			else if (fs.existsSync(RequestedPage))
			{
				const PageData = fs.readFileSync(RequestedPage, {encoding:'utf8', flag:'r'});

				Response.writeHead(200, { "Content-Type": ContentType });
				Response.write(PageData);
				Response.end();	
			}
			else
			{
				Response.writeHead(404, {'Content-Type': 'text/plain'});
				Response.end();
			}
			
		}
		else if (Request.method === "POST")
		{
			Request.on('end', function() {

				if ( Request.rawBody )
				{
					const RequestedContentType = Request.headers['content-type'];
					console.log("Requested ContentType: ", RequestedContentType);

					if (RequestedContentType === 'application/json'
						&& (Request.rawBody.indexOf('{') > -1))
					{
						Request.body = JSON.parse((Request.rawBody));
					}
					else if (RequestedContentType === 'application/x-www-form-urlencoded' //QueryString
								&& (Request.rawBody.indexOf('&') > -1))
					{
						var Query = querystring.parse(Request.rawBody);
						
						Request.body = JSON.parse(JSON.stringify(Query));
					}
					else if (RequestedContentType === 'multipart/form-data')
					{
						//multipart form data is composed like this:
						//[boundary]		-> '-----------------------------19456774526114129871508375949"
						//[content key]		-> 'Content-Disposition: form-data; name="NameLast"'
						//[content value]	-> 'value'
						
						let DataFields = Request.rawBody.split(/[\r\n]*^(?:-+\d+-*)$[\r\n]*/gm);

						let Pairs = [];
						let Attachements = [];

						DataFields.forEach((FieldText) => {

							if (FieldText) //skip empty lines
							{
								//some got a Content-Type like: plain/text, application/octet-stream or application/whatever-composed-name
								if ((FieldText.search(/Content-Type: \w+\/\w+(-\w+)*/m) > -1))
								{
									let NewAttachement = {};
									
									NewAttachement.Filename = FieldText.match(/(?<=(filename=")).*(?=";?[\r\n]+.*$)/m)[0] || "";
									if (NewAttachement.Filename !== '')
									{
										NewAttachement.Data = FieldText.split(/Content-Type: \w+\/\w+(-\w+)*([\r\n]+)/m).pop() || "";

										Attachements.push(NewAttachement);
									}
								}
								else
								{
									let Pair = FieldText.match(/(?<=(name=")).*";?.*$([\r\n]+.*)+/m)[0] || "";							

									Pairs.push((Pair.split(/"[\r\n]+/)));
								}
							}
						});

						Request.body = Object.fromEntries(new Map(Pairs));
						Request.body.Attachements = Attachements;
						
						console.log("Request Body: ", Request.body);
					}
					else
					{
						Response.writeHead(200, { 'Content-Type': MimeContentType['txt'] });
						Response.write( "Requested Content-Type unsupported" );
						Response.end();
						
						return;
					}
					
					if (Request.body.Intent)
					{
						let ProcessUpdateRecord = childprocess.fork(DirectoryBackEnd + '/update-record.js');
						
						if (Request.body.Intent === "Register")
						{	
							const ClientIP = (Request.headers['x-forwarded-for']?.split(',').shift() || Request.socket?.remoteAddress).split(':').pop();
							
							var NewContact = {
								Intent			:	Request.body.Intent,
								Mail			:	Request.body.Mail,
								NameFirst		:	Request.body.NameFirst,
								NameLast		:	Request.body.NameLast,
								//DateAdded		:	new Date(),	//let MySQL do it
								Postcode		:	Request.body.Postcode,
								IPAddress		:	ClientIP
							};
							
							console.log("Registering new contact: ", JSON.stringify(NewContact));
							
							ProcessUpdateRecord.send({SQLLogin : SQLConnectionInfo, ContactInfo : NewContact});
						}
						else if (Request.body.Intent === "Update")
						{
							var UpdateContact = {
									Intent			:	Request.body.Intent,
									Mail			:	Request.body.Mail,
									Postcode		:	Request.body.Postcode,
								};
							
							console.log("Updating existing contact: ", JSON.stringify(UpdateContact));
								
							ProcessUpdateRecord.send({SQLLogin : SQLConnectionInfo, ContactInfo : UpdateContact});
						}
					}
				}

				var ResponseBody = JSON.stringify(Request.body);

				Response.writeHead(200, { 'Content-Type': MimeContentType["json"] });
				Response.write( ResponseBody );
				Response.end();
			});
		}
	}
	catch (e)
	{
		console.error(e);
	}
});

server.listen(3000);

console.log(server.address());

process.exitCode = 0;
