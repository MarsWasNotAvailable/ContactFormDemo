var http = require('http');
var fs = require('fs');
var url = require('url');
var path = require('path');
var ip = require('ip');	//remove -g
var querystring = require('querystring');
var childprocess = require('child_process');
//Express could simplify below

const MimeContentType = {
	"html": "text/html;charset=utf-8",
	"ico" : "image/x-icon",
	"jpeg": "image/jpeg",
	"jpg": "image/jpeg",
	"png": "image/png",
	"js": "text/javascript;charset=utf-8",
	"json" : "application/json;charset=utf-8",
	"css": "text/css"
};

const SQLConnectionInfo ={
	  host: "localhost",
	  port: 2111,
	  user: "dev",
	  password: "dev",
	  database: "gaa_db",
	  multipleStatements: true
	};

let ProcessCreateDatabase = childprocess.fork(process.cwd() + '/create-database.js');
ProcessCreateDatabase.send({SQLLogin : SQLConnectionInfo});
//TODO: check if Database successfully was created - otherwise no need to run below

console.log("Current Working Directory: ", process.cwd());

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
		
		const ContentType = [path.extname(RequestedPage).split(".")[1]];
		RequestedPage = path.join(process.cwd(), RequestedPage);
		
		if (Request.method === "GET")
		{
			if (RequestedURL.pathname === "/retrieve")
			{
				let ProcessCreateDatabase = childprocess.fork(process.cwd() + '/fetch-record.js');
				ProcessCreateDatabase.send({SQLLogin : SQLConnectionInfo});
				
				ProcessCreateDatabase.on('message', function(Message) {
					
					//console.log("Server Fetched: ", Message);
				
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

				//Request.body = "";
				if ( Request.rawBody )
				{
					console.log( "raw body:", Request.rawBody);

					if (Request.rawBody.indexOf('{') > -1) //JSON
					{
						Request.body = JSON.parse((Request.rawBody));
						
						//console.log("Request.body: ", Request.body);
					}
					else if (Request.rawBody.indexOf('&') > -1) //QueryString
					{
						var Query = querystring.parse(Request.rawBody);
						
						Request.body = JSON.parse(JSON.stringify(Query));
					}

					if (Request.body.Intent)
					{	
						//console.log("Intent: ", Request.body.Intent);
						
						let ProcessUpdateRecord = childprocess.fork(process.cwd() + '/update-record.js');
						
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
