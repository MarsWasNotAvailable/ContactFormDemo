var mysql = require('mysql');
var fs = require('fs');

process.on('message', function(Message) {

	var Arguments = {
		DatabaseSetting: Message.SQLLogin//,
		//ContactInfo: Message.ContactInfo
	};

	var MyConnection = mysql.createConnection(Arguments.DatabaseSetting);

	MyConnection.connect(
		function(err) {
			if (err) { console.log(err); }
			else
			{
				console.log("Connected!");
				
				const QueryCreateDatabase = fs.readFileSync('./CreateDatabase.sql', 'utf8');

				MyConnection.query(QueryCreateDatabase, function (err, ResultsArray) {
					
					if (err) { console.log(err); }
					else{
						console.log("Database created");
					}	
				});

				// MyConnection.query("SHOW DATABASES;", function (err, result) {
					// if (err) { console.log(err); }
					// else{
						// console.log(result);
					// }
					
					// process.exit();
				// });
				
				process.exit();
			}
		}
	);
});
