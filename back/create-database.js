var mysql = require('mysql');
var fs = require('fs');
const SQLConnectionInfo = require('./database-login.json');

//process.stdin.pipe(process.stdout);
//process.on('message', function(Message) {
//});

var Arguments = {
	DatabaseSetting: SQLConnectionInfo//,
	//ContactInfo: Message.ContactInfo
};

//We cannot ask to connect to something we may have to create.
Arguments.DatabaseSetting.database = null;
//delete Arguments.DatabaseSetting.database;

var MyConnection = mysql.createConnection(Arguments.DatabaseSetting);

MyConnection.connect(
	function(err) {
		if (err) { console.log(err); }
		else
		{
			//console.log("Connected!");
			
			const QueryCreateDatabase = fs.readFileSync('back/CreateDatabase.sql', 'utf8');

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

