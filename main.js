/** Remark:
*If one tamper with the database, the server will fail gracefully, no throwing, only logging.
 For example, one can drop the database from MySQL Workbench and see that the server simply logs error of bad database name.
 But the server will remain running (serve pages). It would be nice to intervene and contact maintenance system to fix issue.

*I wanted to use process 'input' to pass SQLConnectionInfo (database-login.json), but it seemed simpler to use a require.
 require should cache the first use, but I'm not sure if it applies to all subprocesses.
 I dont expect anything to edit that file while the server is running, should be fine.
*/

var childprocess = require('child_process');
var fs = require('fs');
var path = require('path');

const BackEndDirectory = process.cwd() + '/back';

// let Params = Object.entries(require(BackEndDirectory + '/database-login.json')).reduce((Current, Next) => { Current +=([("--" + Next[0].toString() + "=" + Next[1] + " ")]); return Current; }, "");
// console.log("Params", Params);


let ProcessCreateDatabase = childprocess.spawnSync("node", [BackEndDirectory + '/create-database.js'], { cwd: process.cwd(), stdio : ['pipe', 'inherit', 'inherit'], input: "bla bla" });

if (ProcessCreateDatabase.status === 0)
{
	console.log("Running server...");

	let ProcessRunServer = childprocess.spawnSync("node", [BackEndDirectory + '/server.js'], { cwd: process.cwd() , stdio : ['pipe', 'inherit', 'inherit'], input: "bla bla" });	
}
