//@flow
const fileUpload = require('express-fileupload');
let express = require("express");
let mysql = require("mysql");
let bcrypt = require("bcryptjs");
const privateKEY = require('./keys/private.json');
const publicKEY = require('./keys/public.json');
let jwt = require("jsonwebtoken");
let bodyParser = require("body-parser");
let nodemailer = require("nodemailer");
let config: {host: string, user: string, password: string, email: string, email_passord: string} = require("./config")

let app = express();
app.use(bodyParser.json());

app.use("/uploadRiders", fileUpload());

let DOMAIN = "localhost:3000/"

type Request = express$Request;
type Response = express$Response;

let pool = mysql.createPool({
    connectionLimit: 2,
    host: config.host,
    user: config.user,
    password: config.password,
    database: config.user,
    timezone: 'utc',
    debug: false
});

const ArtistDao = require("./DAO/artistDao.js");
const EventDao = require("./DAO/eventDao.js");
const TicketDao = require("./DAO/ticketDao.js");
const OrganizationDAO = require("./DAO/organizationDao.js");
const UserDao = require("./DAO/userDao.js");
const UserEventDao = require("./DAO/userEventDao.js");

let artistDao = new ArtistDao(pool);
let eventDao = new EventDao(pool);
let ticketDao = new TicketDao(pool);
let userDao = new UserDao(pool);
let organizationDAO= new OrganizationDAO(pool);
let userEventDao = new UserEventDao(pool);

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.email,
        pass: config.email_passord,
    }
});
/*
let mailOptions = {
        from: "systemharmoni@gmail.com",
        to: "dilawarmm@outlook.com",
        subject: "Email",
        text: "Email"
    };

transporter.sendMail(mailOptions, function(err, data) {
    if (err) {
        console.log("Error occurs, ", err);
    }
    else {
        console.log("Success!");
    }
});*/

app.use(function (req, res, next: function) {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Access-Token");
    res.setHeader("Access-Control-Allow-Methods","PUT, POST, GET, OPTIONS, DELETE");
    next();
});

// Plasserer denne MÌDDLEWARE-funksjonen
// foran alle endepunktene under samme path
app.use("/api", (req, res, next) => {
    let token = req.headers["x-access-token"];
    jwt.verify(token, publicKEY, (err, decoded) => {
        if (err) {
            console.log("Token ikke ok.");
            res.status(401);
            res.json({ error: "Not authorized" });
        } else {
            console.log("Token ok: " + decoded.user_id);
            next();
        }
    });
});

app.post('/uploadRiders/:artist_id', function(req, res) {
    console.log("received post request for uploading rider");
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let ridersFile = req.files.riders;
    let hospitality_ridersFile = req.files.hospitality_rider;
    let artist_contractFile = req.files.artist_contract;
    console.log("frrom uploadRiders: ");

    if(req.files.riders) {
        artistDao.insertRider(ridersFile, req.params.artist_id, (status, data) => {
            if (!req.files.hospitality_rider && !req.files.artist_contract) {
                res.status(status);
                res.json(data);
            }
        });
    }
    if(req.files.hospitality_rider) {
            artistDao.insertHospitalityRider(hospitality_ridersFile, req.params.artist_id, (status, data) => {
                if(!req.files.artist_contract){
                    res.status(status);
                    res.json(data);
                }
            })
    }
    if(req.files.artist_contract){
        artistDao.insertArtistContract(artist_contractFile, req.params.artist_id, (status, data) => {
                res.status(status);
                res.json(data);
            })
        }
});
app.post('/uploadHospitality_Riders/:artist_id', (req, res)=> {
    console.log("received post request for uploading hospitality_rider with artist_id: " + req.params.artist_id);
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send("no files uploaded");
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.image;
    console.log("from uploadRiders: ");
    console.log(sampleFile);

    artistDao.insertHospitalityRider(sampleFile, req.params.artist_id, (status, data)=>{
        res.status(status);
        res.json(data);
    });
});
app.post('/uploadArtist_Contract/:artist_id', (req, res)=>{
    console.log("received post request for uploading artist_contract");
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.image;
    console.log("from uploadRiders: ");
    console.log(sampleFile);

    artistDao.insertHospitalityRider(sampleFile, req.params.artist_id, (status, data)=>{
        res.status(status);
        res.json(data);
    });
})

app.get('/Riders/:artist_id', (req, res)=>{
    console.log("received get request for getting riders");

    artistDao.getRider(req.params.artist_id, (status, data)=>{
        res.status(status);
        res.json(data);
    })
})

app.post("/inviteUser", (req, res) => {
    let email: string = req.body.email;
    let org_id: number = req.body.org_id;
    let org_name: string = req.body.org_name;
    let token: string = jwt.sign({org_id: org_id}, privateKEY.key, {
        expiresIn: 3600
    });
    let url: string = DOMAIN + "#/user/" + token;

    let mailOptions = {
        from: "systemharmoni@gmail.com",
        to: email,
        subject: "Invitasjon fra " + org_name,
        text: url
    };

    transporter.sendMail(mailOptions, function(err, data) {
        if (err) {
            console.log("Error: ", err);
        } else {
            console.log("Email sent!");
        }

        res.json(url);
    });
});

app.post("/login", (req, res) => {
    console.log(config.username);
    console.log(req.body);
    userDao.getUser(req.body, (status, data) => {
        res.status(status);
        if (data[0]) {
            console.log(data[0].password);
            bcrypt.compare(req.body.password, data[0].password, function (err, resp) {
                if (resp) {
                    console.log("user_id: " + data[0].user_id);
                    let token: string = jwt.sign({ user_id: data[0].user_id }, privateKEY.key, {
                        expiresIn: 3600
                    });
                    console.log("password matched");
                    res.status(status);
                    console.log("user_id: " + data[0].user_id)
                    res.json({ jwt: token , "user_id": data[0].user_id});
                } else {
                    console.log("password didnt match");
                    res.status(401);
                    res.json({ error: "not authorized" });
                }
            });
        } else {
            res.status(401);
            res.json({ error: "user does not exist" });
        }
    });
});

app.post("/register", (req, res) => {
    console.log(req.body);
    userDao.addUser(req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

/*
app.get("/artist", (req, res) => {
    console.log("/test: received get request from client");
}
*/
//Artist
//tested
app.get("/artist/all", (req : Request, res: Response) => {
    console.log("/artists/all: received get request from client");
    artistDao.getAll((status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("artist/:id/rider",(req:Request,res:Response)=>{
    console.log("/artist/:id/rider: received get request from client");
    artistDao.getRider(req.params.id, (status,data)=>{
        res.status(status);
        res.json(data);
    });
});

app.get("/artist/event/:event_id", (req : Request, res: Response) => {
    console.log("/artist/event: received get request from client");
    artistDao.getEventArtists(req.params.event_id,(status, data) => {
        res.status(status);
        console.log(data);
        res.json(data);
    });
});

app.get("/ticket/event/:event_id", (req : Request, res: Response) => {
    console.log("/ticket/event: received get request from client");
    ticketDao.getEventTickets(req.params.event_id,(status, data) => {
        res.status(status);
        console.log(data);
        res.json(data);
    });
});

app.post("/token", (req, res) => {
    let token: string = req.headers["x-access-token"];
    jwt.verify(token, privateKEY.key, (err, decoded) => {
        if (err) {
            res.status(401);
            res.json({error: "Not Authorized"});
        } else {
            console.log("Token refreshed.");
            token = jwt.sign({user_id: decoded.user_id}, privateKEY.key, {
                expiresIn: 3600
            });
            res.json({jwt: token, "user_id": decoded.user_id});
        }
    });
});

app.get("/generateInvToken/:org_id", (req, res)=>{
    let token = jwt.sign({org_id: req.params.org_id}, privateKEY.key, {
        expiresIn: 3600
    });
    console.log("generated and sent token: " + token);
    res.json({jwt: token});
});

app.post("/invToken", (req, res)=>{
    let token: string = req.headers["x-access-token"];
    jwt.verify(token, privateKEY.key, (err, decoded)=>{
        if (err){
            res.status(401);
            res.json({error: "Not Authorized"});
        }else{
            console.log("Token ok, returning org_id");
            console.log(decoded.org_id);
            res.json({"org_id": decoded.org_id});
        }
    })
});

//tested
app.get("/artist/:id", (req : Request, res: Response) => {
    console.log("/artist/:id: received get request from client");
    artistDao.getOne(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

//tested
/*
app.post("/artist/add", (req : Request, res: Response) => {
    console.log("/artist/add: received post request from client");
    artistDao.insertOne(req.body, (status, data) => {
        res.status(status);
        res.json(data);
        console.log(req.body);
    });
});
 */

app.post("/artist/add", (req : Request, res: Response) => {
    pool.getConnection((err, connection: function) => {
        console.log("Connected to database");
        if (err) {
            console.log("Feil ved oppkobling til databasen");
            res.json({ error: "feil ved oppkobling"});
        } else {
            connection.query(
                "INSERT INTO artist (event_id, artist_name, email, phone, image) values (?,?,?,?,?)",
                [req.body.event_id, req.body.artist_name, req.body.email, req.body.phone, req.body.image],
                err => {
                    if (err) {
                        console.log(err);
                        res.json({ error: "error querying" });
                    } else {
                        connection.query(
                            "SELECT LAST_INSERT_ID() as artist_id",
                            (err, rows) => {
                                connection.release();
                                if (err) {
                                    console.log(err);
                                    res.json({ error: "error querying" });
                                } else {
                                    console.log(rows);
                                    res.json(rows);
                                }
                            }
                        )
                    }
                }
            )
        }
    });
});

//tested

app.delete("/artist/delete/:id", (req : Request, res: Response) => {
    console.log("/artist/delete/:id: received delete request from client");
    pool.getConnection((err, connection: function) => {
          console.log("Connected to database");
          if (err) {
              console.log("Feil ved kobling til databasen");
              res.json({ error: "feil ved oppkobling" });
          } else {
              connection.query(
  				          "DELETE FROM file WHERE artist_id=?",
  				          [req.params.id],
  				          (err, rows) => {
  					               if (err) {
  						                console.log(err);
  						                res.json({ error: "error querying" });
  					               } else {
                             connection.query(
                 				          "DELETE FROM artist WHERE artist_id=?",
                 				          [req.params.id],
                 				          (err, rows) => {
                 					               if (err) {
                 						                     console.log(err);
                 						                     res.json({ error: "error querying" });
                 					               } else {
                                                        console.log(rows);
                                                        res.json(rows);
  					                             }
  				                        }
  			                    );
                          }
                    }
            );
        }
      });
});

app.put("/artist/:id", (req:Request,res:Response)=>{
    console.log("/artist/:id received an update request from client to update values in artist");
    artistDao.updateArtist(req.params.id, req.body, (status,data)=>{
        res.status(status);
        res.json(data);
    })
});

//UserEvent
app.get("/userevent/all/:id", (req : Request, res : Response) => {
    console.log("/test:received update request from user to get userevents");
    eventDao.getUsersForEvent(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.put("/userevent/accepted/", (req : Request, res : Response) => {
    console.log("/test:received update request from user to get userevents");
    eventDao.setAccepted(req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

//Event
//tested
app.get("/event/all", (req : Request, res: Response) => {
    console.log("/event/all: received get request from client");
    eventDao.getAll((status, data) => {
        res.status(status);
        res.json(data);
    });
});

//tested
app.get("/event/:id", (req : Request, res: Response) => {
    console.log("/event/:id: received get request from client");
    eventDao.getEvent(req.params.id, (status, data) => {
        res.status(status);
        console.log(data);
        res.json(data);
    });
});

app.get("/event/time/:id", (req : Request, res: Response) => {
    console.log("/event/time/:id: received get request from client");
    eventDao.getEventTime(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

//tested
app.get("/event/org/:id", (req : Request, res: Response) => {
    console.log("/event/org/:id: received get request from client");
    eventDao.getEventOrg(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});


app.get("/event/upcoming/user/:id", (req : Request, res: Response) => {
    console.log("/event/user/:id: received get request from client");
    eventDao.getEventUpcomingUser(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/event/upcoming/org/:id", (req : Request, res: Response) => {
    console.log("/event/org/:id: received get request from client");
    eventDao.getEventUpcomingOrg(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});


app.get("/event/user/:id", (req : Request, res: Response) => {
    console.log("/event/user/:id: received get request from client");
    eventDao.getEventUser(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.post("/event/add", (req : Request, res: Response) => {
    pool.getConnection((err, connection: function) => {
        console.log("Connected to database");
        if (err) {
            console.log("Feil ved oppkobling til databasen");
            res.json({ error: "feil ved oppkobling"});
        } else {
            connection.query(
                "INSERT INTO event (org_id, user_id, event_name, place, event_start, event_end, longitude, latitude, description) VALUES (?,?,?,?,?,?,?,?,?)",
                [req.body.org_id, req.body.user_id, req.body.event_name, req.body.place, req.body.event_start, req.body.event_end, req.body.longitude, req.body.latitude, req.body.description],
                err => {
                    if (err) {
                        console.log(err);
                        res.json({ error: "error querying" });
                    } else {
                        connection.query(
                            "SELECT LAST_INSERT_ID()",
                            (err, rows) => {
                                connection.release();
                                if (err) {
                                    console.log(err);
                                    res.json({ error: "error querying" });
                                } else {
                                    console.log(rows);
                                    res.json(rows);
                                }
                            }
                        )
                    }
                }
            )
        }
    });
});

app.put("/event/edit/:id", (req : Request, res: Response) => {
    console.log("/event/edit/:id: received put request from client");
    eventDao.editEvent(req.params.id, req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.delete("/event/delete/:id", (req : Request, res: Response) => {
    console.log("/event/delete/:id: received delete request from client");
    pool.getConnection((err, connection: function) => {
          console.log("Connected to database");
          if (err) {
              console.log("Feil ved kobling til databasen");
              res.json({ error: "feil ved oppkobling" });
          } else {
              connection.query(
  				          "DELETE FROM artist WHERE event_id=?",
  				          [req.params.id],
  				          (err, rows) => {
  					               if (err) {
  						                     console.log(err);
  						                     res.json({ error: "error querying" });
  					               } else {
                             connection.query(
                 				          "DELETE FROM ticket WHERE event_id=?",
                 				          [req.params.id],
                 				          (err, rows) => {
                 					               if (err) {
                 						                     console.log(err);
                 						                     res.json({ error: "error querying" });
                 					               } else {
                                           connection.query(
                               				          "DELETE FROM user_event WHERE event_id=?",
                               				          [req.params.id],
                               				          (err, rows) => {
                               					               connection.release();
                               					               if (err) {
                               						                     console.log(err);
                               						                     res.json({ error: "error querying" });
                               					               } else {
                                                         console.log("/test: received delete request from user to delete an event");
                                                         eventDao.deleteEvent(req.params.id, (status, data) => {
                                                                  res.status(status);
                                                                  res.json(data);
                                                         });
                					                             }
                				                        }
                			                    );

  					                             }
  				                        }
  			                    );
                          }
                    }
            );
        }
      });
});

//not tested
app.get("/event/search/:name", (req: Request, res: Response) => {
    console.log("/event/search/:name received put request from client");
    eventDao.getEventbySearch(req.params.name, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

//User
//tested
app.put("/user/admin/:id", (req: Request, res: Response) => {
    console.log("/user/:id received put request from client");
    userDao.setAdminPrivilegesId(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

//tested
app.put("/user/normal/:id", (req: Request, res: Response) => {
    console.log("/user/:id received put request from client");
    userDao.setNormalPrivilegesId(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.put("/Profile/editEmail/:id", (req, res) =>{
    console.log("/Profile/edit received an update request from client ");
    userDao.updateUserEmail(req.params.id, req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.put("/Profile/editImage/:id", (req, res) =>{
    console.log("/Profile/edit received an update request from client ");
    userDao.updateUserImage(req.params.id, req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.put("/Profile/editInfo/:id", (req, res) =>{
    console.log("/Profile/edit received an update request from client ");
    userDao.updateUserInfo(req.params.id, req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.put("/Profile/edit/:id", (req, res) =>{
    console.log("/Profile/edit received an update request from client ");
    userDao.updateUserPass(req.params.id, req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});
app.put("/Profile/updateUsername/:id", (req, res)=>{
    console.log("/Profile/edit received an update request from client ");
    userDao.updateUserName(req.params.id, req.body, (status, data)=>{
        res.status(status);
        res.json(data);
    })
});

app.get("/user/:id", (req: Request, res: Response)=>{
    console.log("/user received get request from client");
    userDao.getUserById(req.params.id, (status, data)=>{
        res.status(status);
        res.json(data);
    });
});

app.delete("/user/delete/:id", (req : Request, res: Response) => {
    console.log("/user/delete/:id: received delete request from client");
    pool.getConnection((err, connection: function) => {
          console.log("Connected to database");
          if (err) {
              console.log("Feil ved kobling til databasen");
              res.json({ error: "feil ved oppkobling" });
          } else {
              connection.query(
  				          "DELETE artist FROM artist INNER JOIN event ON artist.event_id = event.event_id WHERE user_id=?",
  				          [req.params.id],
  				          (err, rows) => {
  					               if (err) {
  						                     console.log(err);
  						                     res.json({ error: "error querying" });
  					               } else {
                             connection.query(
                 				          "DELETE ticket FROM ticket INNER JOIN event ON ticket.event_id = event.event_id WHERE user_id=?",
                 				          [req.params.id],
                 				          (err, rows) => {
                                    if (err) {
                                      console.log(err);
                                      res.json({ error: "error querying" });
                                    } else {
                                      connection.query(
                                        "DELETE FROM user_event WHERE user_id=?",
                                        [req.params.id],
                                        (err, rows) => {
                                          if (err) {
                                            console.log(err);
                                            res.json({ error: "error querying" });
                                          } else {
                                            connection.query(
                                              "DELETE FROM event WHERE user_id=?",
                                              [req.params.id],
                                              (err, rows) => {
                                                if (err) {
                                                  console.log(err);
                                                  res.json({ error: "error querying" });
                                                } else {
                                                  console.log("/user received get request from client");
                                                  userDao.deleteUserById(req.params.id, (status, data) => {
                                                    res.status(status);
                                                    res.json(data);
                                                  });
                                                }
                                              }
                                            );

                                          }
                                        }
                                      );
                                    }
                                  });
  					               }

  				          });
          }
    });
});





app.get("/user/all/:id", (req: Request, res: Response) => {
    console.log("/user/all/:id received get request from client");
    userDao.getAllUsersByOrgId(req.params.id, (status, data)=>{
        res.status(status);
        res.json(data);
    });
});


//UserEvent
//not tested
app.post("/userEvent/add", (req: Request, res: Response) => {
    console.log("/userEvent/add received post request from client");
    userEventDao.addUserEvent(req.body ,(status, data) => {
        res.status(status);
        res.json(data);
    });
});

//not tested
app.get("/userEvent/:id", (req: Request, res: Response) => {
    console.log("/userEvent/:id received get request from client");
    userEventDao.getAllbyId(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/userEvent/users/:id", (req: Request, res: Response) => {
    console.log("/userEvent/users/:id received get request from client");
    userEventDao.getUserbyId(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    })
});

//not tested
app.delete("/userEvent/delete/:user_id/:event_id", (req: Request, res: Response) => {
    console.log("/userEvent/delete/:user_id/:event_id received post request from client");
    userEventDao.deleteUserEvent(req.params.user_id, req.params.event_id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

//not tested
app.put("/userEvent/update/:user_id/:event_id", (req: Request, res: Response) => {
    console.log("/userEvent/update/:user_id/:event_id received post request from client");
    userEventDao.updateUserEvent(req.params.user_id, req.params.event_id, req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});




//Ticket
//tested
app.get("/ticket/all", (req : Request, res: Response) => {
    console.log("/ticket/all: received get request from client");
    ticketDao.getAllTickets((status, data) => {
        res.status(status);
        res.json(data);
    });
});

//tested
app.get("/ticket/:id", (req : Request, res: Response) => {
    console.log("/ticket/:id: received get request from client");
    ticketDao.getTicket(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

//tested
app.get("/ticket/remaining/:id", (req : Request, res: Response) => {
    console.log("/ticket/remaining/:id: received get request from client");
    ticketDao.getNumberOfRemainingTickets(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

//tested
app.post("/ticket/add", (req : Request, res: Response) => {
    console.log("/ticket/add: received get request from client");
    ticketDao.addTicket(req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

//tested
app.put("/ticket/edit/:id", (req : Request, res: Response) => {
    console.log("/ticket/edit/:id: received put request from client");
    ticketDao.updateTicket(req.params.id, req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

//tested
app.delete("/ticket/delete/:id", (req : Request, res: Response) => {
    console.log("/ticket/delete/:id: received delete request from client");
    ticketDao.deleteTicket(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

//Organization
//tested
app.get("/organization/mail/:mail",(req:Request,res:Response)=>{
    console.log("/test: received get request from client for organization by ID");
    organizationDAO.getOrgByUserEmail(req.params.mail, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

//tested
app.get("/organization/id/:id",(req:Request,res:Response)=>{
    console.log("/test: received get request from client for organization by ID");
    organizationDAO.getOrganization(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

//tested
app.get("/organization/all",(req : Request, res : Response) => {
    console.log("/test: received get request from client for all organizations");
    organizationDAO.getAllOrganizations((status, data) => {
        res.status(status);
        res.json(data);
    });
});

//tested

app.post("/organization/add", (req : Request, res : Response) => {
    pool.getConnection((err, connection: function) => {
        console.log("Connected to database");
        if (err) {
            console.log("Feil ved oppkobling til databasen");
            res.json({ error: "feil ved oppkobling"});
        } else {
            connection.query(
                "INSERT INTO organization(org_name, phone, email) VALUES (?,?,?)",
                [req.body.org_name, req.body.phone, req.body.email],
                err => {
                    if (err) {
                        console.log(err);
                        res.json({ error: "error querying" });
                    } else {
                        connection.query(
                            "SELECT LAST_INSERT_ID() AS org_id",
                            (err, rows) => {
                                connection.release();
                                if (err) {
                                    console.log(err);
                                    res.json({ error: "error querying" });
                                } else {
                                    console.log(rows);
                                    res.json(rows);
                                }
                            }
                        )
                    }
                }
            )
        }
    });
});



//tested
app.delete("/organization/delete/:id", (req : Request, res: Response) => {
    console.log("/organization/delete/:id: received delete request from client");
    pool.getConnection((err, connection: function) => {
          console.log("Connected to database");
          if (err) {
              console.log("Feil ved kobling til databasen");
              res.json({ error: "feil ved oppkobling" });
          } else {
              connection.query(
  				          "DELETE artist FROM artist INNER JOIN event ON artist.event_id = event.event_id WHERE org_id=?",
  				          [req.params.id],
  				          (err, rows) => {
  					               if (err) {
  						                     console.log(err);
  						                     res.json({ error: "error querying" });
  					               } else {
                             connection.query(
                 				          "DELETE ticket FROM ticket INNER JOIN event ON ticket.event_id = event.event_id WHERE org_id=?",
                 				          [req.params.id],
                 				          (err, rows) => {
                 					               if (err) {
                 						                     console.log(err);
                 						                     res.json({ error: "error querying" });
                 					               } else {
                                           connection.query(
                               				          "DELETE user_event FROM user_event INNER JOIN event ON user_event.event_id = event.event_id WHERE org_id=?",
                               				          [req.params.id],
                               				          (err, rows) => {
                               					               if (err) {
                               						                     console.log(err);
                               						                     res.json({ error: "error querying" });
                               					               } else {
                                                         connection.query(
                                             				          "DELETE FROM event WHERE org_id=?",
                                             				          [req.params.id],
                                             				          (err, rows) => {
                                             					               if (err) {
                                             						                     console.log(err);
                                             						                     res.json({ error: "error querying" });
                                             					               } else {
                                                                       connection.query(
                                                           				          "DELETE FROM user WHERE org_id=?",
                                                           				          [req.params.id],
                                                           				          (err, rows) => {
                                                                                connection.release();
                                                           					               if (err) {
                                                           						                     console.log(err);
                                                           						                     res.json({ error: "error querying" });
                                                           					               } else {
                                                                                     console.log("/test: received delete request from user to delete an organization");
                                                                                     organizationDAO.deleteOrganization(req.params.id, (status, data) => {
                                                                                         res.status(status);
                                                                                         res.json(data);
                                                                                     });
                                            					                             }
                                            				                        }
                                            			                    );

                              					                             }
                              				                        }
                              			                    );

                					                             }
                				                        }
                			                    );

  					                             }
  				                        }
  			                    );
                          }
                    }
            );
        }
      });
});



//tested
app.put("/organization/edit/:id", (req : Request, res : Response) => {
    console.log("/test:received update request from user to update organization");
    organizationDAO.updateOrganization(req.params.id, req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

let server = app.listen(8080);
