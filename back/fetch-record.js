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
			if (err)
			{
				console.log(err);
			}
			else
			{
				//console.log("Connected!");
				
				//let Query = "SELECT * FROM <?>.Contact;";
				//Query.replace("<?>", (Arguments.DatabaseSetting).database);
				
				MyConnection.query("SELECT * FROM Contact;", function (err, result) {
					if (err) { console.log(err); }
					else{
						const Privacy = true;
						
						if (Privacy)
						{
							result.forEach((Each)=>{
								Each.IP = "Private";
							});
						}
						
						process.send({ FetchedRecords : result });
						
						//console.log("fetched: ", result);
					}
					
					process.exit();
				});

			}
		}
	);
});
