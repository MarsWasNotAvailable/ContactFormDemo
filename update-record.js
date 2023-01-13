var mysql = require('mysql');
var fs = require('fs');

process.on('message', function(Message) {

	var Arguments = {
		DatabaseSetting: Message.SQLLogin,
		ContactInfo: Message.ContactInfo
	};

	var MyConnection = mysql.createConnection(Arguments.DatabaseSetting);

	MyConnection.connect(
		function(err) {
			if (err) { console.log(err); }
			else
			{
				console.log("Connected!");
				
				if (Arguments.ContactInfo.Intent === "Register")
				{
					const ValuesToInsert = [
						Arguments.ContactInfo.Mail,
						Arguments.ContactInfo.NameFirst,
						Arguments.ContactInfo.NameLast,
						Arguments.ContactInfo.Postcode,
						Arguments.ContactInfo.IPAddress
						];
						
					//Insert is to create new row
					var QueryString = "INSERT INTO Contact (Mail, NameFirst, NameLast, DateAdded, Postcode, IP) VALUES (?, ?, ?, NOW(), ?, ?)";
					MyConnection.query(QueryString, ValuesToInsert, function (err, ResultsArray) { 
					
						if (err) { console.log(err); }
						else{
							//console.log("INSERT QUERY Results: ", ResultsArray);
						}
					});
				}
				else if (Arguments.ContactInfo.Intent === "Update")
				{
					//Update existing record
					var QueryString = "UPDATE Contact SET Postcode = ? WHERE Mail = ?";
					MyConnection.query(QueryString, [Arguments.ContactInfo.Postcode, Arguments.ContactInfo.Mail], function (err, ResultsArray) { });
				}

				//gaa_db
				// MyConnection.query("SELECT * FROM Contact", function (err, result) {
					// if (err) { console.log(err); }
					// else{
						// console.log("DB Results: ", result);
					// }
					
					// process.exit();
				// });
				
				process.exit();
			}
		}
	);
});
