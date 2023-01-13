
## Description
I was asked to make a Contact form as a test, by plausible employer.

- Contact Form needs to take in: User Identity, Mail, Postcode, Date Of Submission, User IP
- Pop-in -> Pop up ?
- Toast
- Form Validation before sending
- A second page for administration: to edit Postcode field only.

So basically:

**EDITABLE**

| Mail		| FirstName | LastName 	| **Editable Postcode**	| Date		| IP Address	|
| ------	| ------	| ------	| ------				| ------	| ------ 		|
| wow@g.com	| Wow		| Gee		| 12345					| 20230101	| 200.5.32.104 	|


## Setup

> The database is handled by MySQL:
I used mysql-installer-community-8.0.31.0.msi
Run as a service before calling on the server code described below.
I created a dev user, with "dev" as password:
the correct user for the connection is specified in server.js
As a side note, I got some issue with mysql executables with:
mysql -u root -p root
mysql -u dev -p dev
It would fails to login, when provided password, it was a mess.
I ended up using MySQL Workbench to set up a few experiments.
Also got some issue connecting:
"Client does not support authentication protocol requested by server; consider upgrading MySQL client"
Executed this from MySQLWorkbench to fix it:
ALTER USER 'dev'@'localhost' IDENTIFIED WITH mysql_native_password BY 'dev';
flush privileges;

> The server is handled by NodeJS (a choice), using http-server module:
npm install -g http-server
dont forget it has to be in the PATH: can add "/AppData/Roaming/npm"
From the project root, one can use: http-server -o
to display the client interface but it wont be enough for the server/mysql required.
**To run the server, one can call: node server.js**
Some other required package (I installed them globally): http, mysql, fs, url, path, ip

> Then one can got to localhost:3000
The server will redirect to index.html, allowing to create a popup ContactForm from a button.
One can ask for localhost:3000/admin.html to edit the Postcode field of the registered users.

## Next

The current React is pretty light: no real point to use it, mostly back-end work there.
It was just part of the assignment, or something.
But could be interesting to upgrade this project, specifically style.
