var mysql = require('mysql');
var fs = require('fs');
//const SQLConnectionInfo = require('./database-login.json');
const SQLConnectionInfo = require('/etc/secrets/database-login.json');

//We cannot ask to connect to something we may have to create.
let FirstConnection = SQLConnectionInfo;
//FirstConnection.database = null;
delete FirstConnection.database;

var MyConnection = mysql.createConnection(FirstConnection);

MyConnection.connect(
	function(err) {
		if (err) { console.log(err); }
		else
		{
			//console.log("Connected!");
			
			const QueryCreateDatabaseDefault = fs.readFileSync('back/CreateDatabase.sql', 'utf8');
			
			let QueryCreateDatabase = QueryCreateDatabaseDefault.replaceAll('`marsdemo_default_db`', `\`${SQLConnectionInfo.database}\``).toString();

			MyConnection.query(QueryCreateDatabase, function (err, ResultsArray) {
				
				if (err)
				{
					process.exitCode = 1;
					console.log("Failed to initialize database:\n", err);
				}
				else{
					process.exitCode = 0;
					console.log("Database is live.");
				}
				
				process.exit();
			});

			// MyConnection.query("SHOW DATABASES;", function (err, result) {
			// 	if (err) { console.log(err); }
			// 	else{ console.log(result); }
			// 	process.exit();
			// });
		}
	}
);

