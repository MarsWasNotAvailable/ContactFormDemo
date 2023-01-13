var mysql = require('mysql');
var fs = require('fs');
//var childprocess = require('child_process');

process.on('message', function(Message) {

	var Arguments = {
		DatabaseSetting: Message.SQLLogin//,
		//ContactInfo: Message.ContactInfo
	};

	var MyConnection = mysql.createConnection(Arguments.DatabaseSetting);

	MyConnection.connect(
		function(err) {
			if (err)
			{
				console.log(err);
			}
			else
			{
				//console.log("Connected!");
				
				//"SHOW DATABASES;"

				MyConnection.query("SELECT * FROM gaa_db.Contact;", function (err, result) {
					if (err) { console.log(err); }
					else{
						process.send({ FetchedRecords : result });
						
						//console.log("fetched: ", result);
					}
					
					process.exit();
				});

			}
		}
	);
});
