Description
-----------

I was asked to make a Contact form as a test, by plausible employer.

-   React JS for UI - MySQL or Postgres for Database
-   Contact Form needs to take in: User Identity, Mail, Postcode, Date Of Submission, User IP
-   Form must be in a Pop-in -\> I assumed that means Pop-up
-   Toast notifications bound to back-end operations
-   Form Validation before sending
-   A second page for administration: to edit Postcode field only.

So basically:

| Mail       | FirstName | LastName | Postcode             | Date     | IP Address   |
|------------|-----------|----------|----------------------|----------|--------------|
| wow\@g.com | Wow       | Gee      | 12345 (**EDITABLE**) | 20230101 | 200.5.32.104 |

Setup
-----

>   The database is handled by **MySQL**: I used
>   mysql-installer-community-8.0.31.0.msi  
>   **Run it as a service** before calling on the server code described below.
>   The database connection setting must be specified in
>   **back/database-login.json**

>   This whole web app is handled by **NodeJS** (a choice):  
>   `npm install -g http-server http, mysql, url, path, querystring`.  
>   Dont forget nodejs has to be in the PATH: can add "/AppData/Roaming/npm"  
>   **To run the server, one can call:**  
>   `npm start` **or** `node main.js`

>   Then one can navigate to *localhost:3000*  
>   The server will redirect to *index.html*, allowing to create a popup
>   ContactForm from a button.  
>   One can ask for *localhost:3000/admin.html* to edit the Postcode field of
>   the registered users.

Next
----

The current React work is pretty light: there is so little UI needed.
It was part of the assignment, and I dont like it (like building a rocket to drive downtown).
Currently it's using Babel in standalone mode to generate the UI.
Next time, It could be interesting to use create-react-app.

Notes
-----

### I got some issue with mysql authentification:

I created a dev user, with "dev" as password:  
`mysql -u root -p root`  
`mysql -u dev -p dev`  
It would fails to login, when provided password, it was a mess.  
I ended up using MySQL Workbench to set up a few experiments.  
Also got some issue connecting: *"Client does not support authentication
protocol requested by server; consider upgrading MySQL client"*. Executed this
from MySQLWorkbench to fix it:  
`ALTER USER 'dev'@'localhost' IDENTIFIED WITH mysql_native_password BY   'dev';`  
`flush privileges;`

### I got some issue installing node’s mysql package globally.
