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
let config: {host: string, user: string, password: string, email: string, email_passord: string} = require("./config");
const path = require("path");
const {Storage} = require('@google-cloud/storage');
const multer = require('multer');
const fs = require('fs');


const gc = new Storage({
    keyFilename: path.join(__dirname, '../harmoni_google_cloud.json'),
    projectId: 'profound-veld-253208'
});

//gc.getBuckets().then(x => console.log(x));

const bucketName = 'harmoni-files';

async function uploadFile(filename: string) {
    await gc.bucket(bucketName).upload(filename, {
        resumable: false,
        gzip: true,
        metadata: {
            cacheControl: 'public, max-age=31536000',
        }
    });
    console.log(`${filename} uploaded to ${bucketName}.`);
    fs.unlinkSync(filename);
}

//uploadFile(path.join(__dirname, "../org.png"));

let app = express();
app.use(bodyParser.json());

app.use("/upload", fileUpload());

let DOMAIN = "localhost:3000/"

type
Request = express$Request;
type
Response = express$Response;

let pool = mysql.createPool({
    connectionLimit: 3,
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
let organizationDAO = new OrganizationDAO(pool);
let userEventDao = new UserEventDao(pool);

let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.email,
        pass: config.email_passord,
    }
});

app.use(function (req, res, next:

function

)
{
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000"); // update to match the domain you will make the request from
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Access-Token");
    res.setHeader("Access-Control-Allow-Methods", "PUT, POST, GET, OPTIONS, DELETE");
    next();
}
)
;

// Places this MÌDDLEWARE-function
// in front of all endpoints with the same path
app.use("/api", (req, res, next) => {
    let token = req.headers["x-access-token"];
    jwt.verify(token, publicKEY, (err, decoded) => {
        if (err) {
            console.log("Token ikke ok.");
            res.status(401);
            res.json({error: "Not authorized"});
        } else {
            console.log("Token ok: " + decoded.user_id);
            next();
        }
    });
});

//EVENT
app.get("/event/all", (req: Request, res: Response) => {
    console.log("/event/all: received get request from client");
    eventDao.getAll((status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/event/:id", (req: Request, res: Response) => {
    console.log("/event/:id: received get request from client");
    eventDao.getEvent(req.params.id, (status, data) => {
        res.status(status);
        console.log(data);
        res.json(data);
    });
});

app.get("/event/time/:id", (req: Request, res: Response) => {
    console.log("/event/time/:id: received get request from client");
    eventDao.getEventTime(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/event/user/:id", (req: Request, res: Response) => {
    console.log("/event/user/:id: received get request from client");
    eventDao.getEventUser(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/event/org/:id", (req: Request, res: Response) => {
    console.log("/event/org/:id: received get request from client");
    eventDao.getEventOrg(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/event/upcoming/user/:id", (req: Request, res: Response) => {
    console.log("/event/user/:id: received get request from client");
    eventDao.getEventUpcomingUser(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/event/upcoming/org/:id", (req: Request, res: Response) => {
    console.log("/event/org/:id: received get request from client");
    eventDao.getEventUpcomingOrg(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/event/current/user/:id", (req: Request, res: Response) => {
    console.log("/event/current/user/:id: received put request from client");
    eventDao.getEventCurrentUser(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/event/current/org/:id", (req: Request, res: Response) => {
    console.log("/event/current/org/:id: received put request from client");
    eventDao.getEventCurrentOrg(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/event/previous/user/:id", (req: Request, res: Response) => {
    console.log("/event/user/:id: received get request from client");
    eventDao.getEventPreviousUser(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/event/previous/org/:id", (req: Request, res: Response) => {
    console.log("/event/org/:id: received get request from client");
    eventDao.getEventPreviousOrg(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/event/cancelled/user/:id", (req: Request, res: Response) => {
    console.log("/event/cancelled/user/:id received get request from client");
    eventDao.getCancelledUser(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/event/cancelled/org/:id", (req: Request, res: Response) => {
    console.log("/event/cancelled/org/:id received get request from client");
    eventDao.getCancelledOrg(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/event/pending/:id", (req: Request, res: Response) => {
    console.log("/event/pending/:id received get request from client");
    eventDao.getPending(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.put("/event/pending/:id", (req: Request, res: Response) => {
    console.log("/event/pending/:id received put request from client");
    eventDao.setCompleted(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.put("/event/accepted/:id", (req: Request, res: Response) => {
    console.log("/artist/:id received an update request from client to update values in artist");
    eventDao.setAcceptedEvent(req.params.id, req.body, (status, data) => {
        res.status(status);
        res.json(data);
    })
});

app.post("/event/add", (req: Request, res: Response) => {
    pool.getConnection((err, connection:

    function

) =>
    {
        console.log("Connected to database");
        if (err) {
            console.log("Feil ved oppkobling til databasen");
            res.json({error: "feil ved oppkobling"});
        } else {
            connection.query(
                "INSERT INTO event (org_id, user_id, event_name, place, event_start, event_end, longitude, latitude, description) VALUES (?,?,?,?,?,?,?,?,?)",
                [req.body.org_id, req.body.user_id, req.body.event_name, req.body.place, req.body.event_start, req.body.event_end, req.body.longitude, req.body.latitude, req.body.description],
                err => {
                    if (err) {
                        console.log(err);
                        res.json({error: "error querying"});
                    } else {
                        connection.query(
                            "SELECT LAST_INSERT_ID()",
                            (err, rows) => {
                                connection.release();
                                if (err) {
                                    console.log(err);
                                    res.json({error: "error querying"});
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
    }
)
    ;
});

app.put("/event/cancel/:id", (req: Request, res: Response) => {
    console.log("/event/cancel/:id");
    eventDao.cancelEvent(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.put("/event/edit/:id", (req: Request, res: Response) => {
    console.log("/event/edit/:id: received put request from client");
    eventDao.editEvent(req.params.id, req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/event/search/:name/:org_id", (req: Request, res: Response) => {
    console.log("/event/search/:name/:org_id received put request from client");
    eventDao.getEventbySearch(req.params.name, req.params.org_id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.post("/event/add/notify/:event_id", (req: Request, res: Response) => {
    console.log("/event/add/notify/:event_id received post request from client");
    let name: string = req.body.name;
    let job_position: number = req.body.job_position;
    let email: string = req.body.email;

    let url: string = DOMAIN + "#/showEvent/" + req.params.event_id;

    let mailOptions = {
        from: "systemharmoni@gmail.com",
        to: email,
        subject: "Tilud om vakt",
        text: "Hei! Du har blitt satt opp som " + job_position + " for arrangemenet: " + name + ". Besøk " + url
    };

    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log("Error: ", err);
        } else {
            console.log("Email sent!");
        }

        res.json(url);
    });
});

app.post("/event/delete/notify/:event_id", (req: Request, res: Response) => {
    console.log("/event/add/notify/:event_id received post request from client");
    let name: string = req.body.name;
    let job_position: number = req.body.job_position;
    let email: string = req.body.email;

    let url: string = DOMAIN + "#/showEvent/" + req.params.event_id;

    let mailOptions = {
        from: "systemharmoni@gmail.com",
        to: email,
        subject: "Det er gjort endringer i din vakt",
        text: "Hei! Du er ikke lenger satt opp på vakt på dette arrangementet: " + url
    };

    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log("Error: ", err);
        } else {
            console.log("Email sent!");
        }

        res.json(url);
    });
});

app.post("/cancelled", (req, res) => {
    let email: string = req.body.email;
    let org_id: number = req.body.org_id;
    let org_name: string = req.body.org_name;
    let event: string = req.body.event_name;
    let token: string = jwt.sign({org_id: org_id}, privateKEY.key, {
        expiresIn: 3600
    });
    let url: string = DOMAIN + "#/user/" + token;
    let mailOptions = {
        from: "systemharmoni@gmail.com",
        to: email,
        subject: "ARRANGEMENT AVLYST!",
        text: "Arrangementet " + event + " har blitt avlyst av arrangøren " + org_name
    };
    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log("Error: ", err);
        } else {
            console.log("Email sent!");
        }
        res.json(url);
    });
});


app.post("/event/edit/notify/:event_id", (req: Request, res: Response) => {
    console.log("/event/add/notify/:event_id received post request from client");
    let name: string = req.body.name;
    let job_position: number = req.body.job_position;
    let email: string = req.body.email;

    let url: string = DOMAIN + "#/showEvent/" + req.params.event_id;

    let mailOptions = {
        from: "systemharmoni@gmail.com",
        to: email,
        subject: "Endringer i arrangement",
        text: "Hei! Det har blitt gjort endringer på et arrangement hvor du er satt opp på vakt. Trykk på lenken for å se endringene: " + url
    };

    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log("Error: ", err);
        } else {
            console.log("Email sent!");
        }

        res.json(url);
    });
});

//ARTIST
app.get("/artist/all", (req: Request, res: Response) => {
    console.log("/artists/all: received get request from client");
    artistDao.getAll((status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/artist/rider/:id", (req: Request, res: Response) => {
    console.log("/artist/:id/rider: received get request from client");
    artistDao.getRiders(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/artist/event/:event_id", (req: Request, res: Response) => {
    console.log("/artist/event: received get request from client");
    artistDao.getEventArtists(req.params.event_id, (status, data) => {
        res.status(status);
        console.log(data);
        res.json(data);
    });
});

app.get("/artist/:id", (req: Request, res: Response) => {
    console.log("/artist/:id: received get request from client");
    artistDao.getOne(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.put("/artist/:id", (req: Request, res: Response) => {
    console.log("/artist/:id received an update request from client to update values in artist");
    artistDao.updateArtist(req.params.id, req.body, (status, data) => {
        res.status(status);
        res.json(data);
    })
});

app.put("/artist/accepted/:id", (req: Request, res: Response) => {
    console.log("/artist/:id received an update request from client to update values in artist");
    artistDao.setAccepted(req.params.id, req.body, (status, data) => {
        res.status(status);
        res.json(data);
    })
});

app.post("/artist/add", (req: Request, res: Response) => {
    pool.getConnection((err, connection:

    function

) =>
    {
        console.log("Connected to database");
        if (err) {
            console.log("Feil ved oppkobling til databasen");
            res.json({error: "feil ved oppkobling"});
        } else {
            connection.query(
                "INSERT INTO artist (event_id, artist_name, email, phone, image) values (?,?,?,?,?)",
                [req.body.event_id, req.body.artist_name, req.body.email, req.body.phone, req.body.image],
                err => {
                    if (err) {
                        console.log(err);
                        res.json({error: "error querying"});
                    } else {
                        connection.query(
                            "SELECT LAST_INSERT_ID() as artist_id",
                            (err, rows) => {
                                connection.release();
                                if (err) {
                                    console.log(err);
                                    res.json({error: "error querying"});
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
    }
)
    ;
});

app.delete("/artist/delete/:id", (req: Request, res: Response) => {
    console.log("/artist/delete/:id: received delete request from client");
    pool.getConnection((err, connection:

    function

) =>
    {
        console.log("Connected to database");
        if (err) {
            console.log("Feil ved kobling til databasen");
            res.json({error: "feil ved oppkobling"});
        } else {
            connection.query(
                "DELETE FROM file WHERE artist_id=?",
                [req.params.id],
                (err, rows) => {
                    if (err) {
                        console.log(err);
                        res.json({error: "error querying"});
                    } else {
                        connection.query(
                            "DELETE FROM artist WHERE artist_id=?",
                            [req.params.id],
                            (err, rows) => {
                                if (err) {
                                    console.log(err);
                                    res.json({error: "error querying"});
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
    }
)
    ;
});
/*
app.post('/uploadRiders/:artist_id', function(req, res) {
    console.log("received post request for uploading rider");
    if (!req.files || Object.keys(req.files).length === 0) {
        return;
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let ridersFile = req.files.riders;
    let hospitality_ridersFile = req.files.hospitality_rider;
    let artist_contractFile = req.files.artist_contract;
    console.log("frrom uploadRiders: ");
    console.log(req.files);

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
});*/

app.put('/uploadRiders/:artist_id', function (req, res) {
    console.log("received post request for uploading rider");
    if (!req.files || Object.keys(req.files).length === 0) {
        return;
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let ridersFile = req.files.riders;
    let hospitality_ridersFile = req.files.hospitality_rider;
    let artist_contractFile = req.files.artist_contract;
    console.log("frrom uploadRiders: ");
    console.log(req.files);

    if (req.files.riders) {
        artistDao.updateRiders(ridersFile, req.params.artist_id, (status, data) => {
            if (!req.files.hospitality_rider && !req.files.artist_contract) {
                res.status(status);
                res.json(data);
            }
        });
    }
    if (req.files.hospitality_rider) {
        artistDao.updateHospitalityRiders(hospitality_ridersFile, req.params.artist_id, (status, data) => {
            if (!req.files.artist_contract) {
                res.status(status);
                res.json(data);
            }
        })
    }
    if (req.files.artist_contract) {
        artistDao.updateArtistContract(artist_contractFile, req.params.artist_id, (status, data) => {
            res.status(status);
            res.json(data);
        })
    }
});

app.put('/upload/riders/:artist_id', (req, res) => {
    console.log("/upload/Hospitality_Riders received an update request from client ");
    //const file = req.file;
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400);
    }
    let ridersFileName: string = "";
    let hospitality_ridersFileName: string = "";
    let artist_contractFileName: string = "";

    if (req.files.riders) {
        let ridersFile = req.files.riders;
        ridersFileName = Date.now() + "-" + ridersFile.name;

        ridersFile.mv(path.join(__dirname, 'uploads/' + ridersFileName), err => {
            if (err) return res.status(500);
        });
        uploadFile(path.join(__dirname, 'uploads/' + ridersFileName));
    }
    if (req.files.hospitality_rider) {
        let hospitality_ridersFile = req.files.hospitality_rider;
        hospitality_ridersFileName = Date.now() + "-" + hospitality_ridersFile.name;

        hospitality_ridersFile.mv(path.join(__dirname, 'uploads/' + hospitality_ridersFileName), err => {
            if (err) return res.status(500);
        });
        uploadFile(path.join(__dirname, 'uploads/' + hospitality_ridersFileName));
    }
    if (req.files.artist_contract) {
        let artist_contractFile = req.files.artist_contract;
        artist_contractFileName = Date.now() + "-" + artist_contractFile.name;
        artist_contractFile.mv(path.join(__dirname, 'uploads/' + artist_contractFileName), err => {
            if (err) return res.status(500);
        });
        uploadFile(path.join(__dirname, 'uploads/' + artist_contractFileName));
    }

    artistDao.updateRiders(req.params.artist_id, ridersFileName, hospitality_ridersFileName, artist_contractFileName, (status, data) => {
        res.status(status);
        res.json(data);
    });
});
/*
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
});

 */

/*
app.get('/Riders/:artist_id', (req, res)=>{
    console.log("received get request for getting riders");

    artistDao.getRider(req.params.artist_id, (status, data)=>{
        res.status(status);
        res.json(data);
    });
});
 */

//TICKET
app.get("/ticket/all", (req: Request, res: Response) => {
    console.log("/ticket/all: received get request from client");
    ticketDao.getAllTickets((status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/ticket/:id", (req: Request, res: Response) => {
    console.log("/ticket/:id: received get request from client");
    ticketDao.getTicket(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/ticket/remaining/:id", (req: Request, res: Response) => {
    console.log("/ticket/remaining/:id: received get request from client");
    ticketDao.getNumberOfRemainingTickets(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.post("/ticket/add", (req: Request, res: Response) => {
    console.log("/ticket/add: received get request from client");
    ticketDao.addTicket(req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.put("/ticket/edit/:id", (req: Request, res: Response) => {
    console.log("/ticket/edit/:id: received put request from client");
    ticketDao.updateTicket(req.params.id, req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.delete("/ticket/delete/:id", (req: Request, res: Response) => {
    console.log("/ticket/delete/:id: received delete request from client");
    ticketDao.deleteTicket(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});


app.get("/ticket/event/:event_id", (req: Request, res: Response) => {
    console.log("/ticket/event: received get request from client");
    ticketDao.getEventTickets(req.params.event_id, (status, data) => {
        res.status(status);
        console.log(data);
        res.json(data);
    });
});

//USEREVENT
app.get("/userevent/all/:id", (req: Request, res: Response) => {
    console.log("/test:received update request from user to get userevents");
    eventDao.getUsersForEvent(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.put("/userevent/accepted/", (req: Request, res: Response) => {
    console.log("/test:received update request from user to get userevents");
    eventDao.setAccepted(req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.post("/userEvent/add", (req: Request, res: Response) => {
    console.log("/userEvent/add received post request from client");
    userEventDao.addUserEvent(req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

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

app.delete("/userEvent/delete/:user_id/:event_id", (req: Request, res: Response) => {
    console.log("/userEvent/delete/:user_id/:event_id received post request from client");
    userEventDao.deleteUserEvent(req.params.user_id, req.params.event_id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.put("/userEvent/update/:user_id/:event_id", (req: Request, res: Response) => {
    console.log("/userEvent/update/:user_id/:event_id received post request from client");
    userEventDao.updateUserEvent(req.params.user_id, req.params.event_id, req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

//USER
app.get("/user/all/:id", (req: Request, res: Response) => {
    console.log("/user/all/:id received get request from client");
    userDao.getAllUsersByOrgId(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.put("/user/makeAdmin/:id", (req: Request, res: Response) => {
    console.log("/user/makeAdmin/:id received get request from client");
    userDao.makeAdmin(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/user/:id", (req: Request, res: Response) => {
    console.log("/user received get request from client");
    userDao.getUserById(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.delete("/user/delete/:id", (req: Request, res: Response) => {
    console.log("/user/delete/:id: received delete request from client");
    pool.getConnection((err, connection:

    function

) =>
    {
        console.log("Connected to database");
        if (err) {
            console.log("Feil ved kobling til databasen");
            res.json({error: "feil ved oppkobling"});
        } else {
            connection.query(
                "DELETE artist FROM artist INNER JOIN event ON artist.event_id = event.event_id WHERE user_id=?",
                [req.params.id],
                (err, rows) => {
                    if (err) {
                        console.log(err);
                        res.json({error: "error querying"});
                    } else {
                        connection.query(
                            "DELETE ticket FROM ticket INNER JOIN event ON ticket.event_id = event.event_id WHERE user_id=?",
                            [req.params.id],
                            (err, rows) => {
                                if (err) {
                                    console.log(err);
                                    res.json({error: "error querying"});
                                } else {
                                    connection.query(
                                        "DELETE FROM user_event WHERE user_id=?",
                                        [req.params.id],
                                        (err, rows) => {
                                            if (err) {
                                                console.log(err);
                                                res.json({error: "error querying"});
                                            } else {
                                                connection.query(
                                                    "DELETE FROM event WHERE user_id=?",
                                                    [req.params.id],
                                                    (err, rows) => {
                                                        if (err) {
                                                            console.log(err);
                                                            res.json({error: "error querying"});
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
    }
)
    ;
});

app.get("/user/admin/:org_id", (req: Request, res: Response) => {
    console.log("/user/admin/:org_id received get request from client");
    userDao.getAdminByOrgId(req.params.org_id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});
app.put("/user/admin/:id", (req: Request, res: Response) => {
    console.log("/user/:id received put request from client");
    userDao.setAdminPrivilegesId(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.put("/user/normal/:id", (req: Request, res: Response) => {
    console.log("/user/:id received put request from client");
    userDao.setNormalPrivilegesId(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.put("/user/resetPass", (req, res) => {
    console.log("/user/resetPass received an update request from client ");
    userDao.resetPass(req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.put("/user/updatePrivileges/:id", (req, res) => {
    console.log("/user/updatePriviliges received an update request from client ");
    userDao.setPrivilegesId(req.params.id, req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.post("/register", (req, res) => {
    console.log("req.body from server: ");
    console.log(req.body);
    userDao.addUser(req.body, (status, data) => {
        res.status(status);
        res.json(data);
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
                    let token: string = jwt.sign({user_id: data[0].user_id}, privateKEY.key, {
                        expiresIn: 3600
                    });
                    console.log("password matched");
                    res.status(status);
                    console.log("user_id: " + data[0].user_id)
                    res.json({jwt: token, "user_id": data[0].user_id});
                } else {
                    console.log("password didnt match");
                    res.status(401);
                    res.json({error: "not authorized"});
                }
            });
        } else {
            res.status(401);
            res.json({error: "user does not exist"});
        }
    });
});

app.put("/Profile/editEmail/:id", (req, res) => {
    console.log("/Profile/edit received an update request from client ");
    userDao.updateUserEmail(req.params.id, req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.put("/Profile/editImage/:id", (req, res) => {
    console.log("/Profile/edit received an update request from client ");
    userDao.updateUserImage(req.params.id, req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.put("/Profile/editInfo/:id", (req, res) => {
    console.log("/Profile/edit received an update request from client ");
    userDao.updateUserInfo(req.params.id, req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.put("/Profile/edit/:id", (req, res) => {
    console.log("/Profile/edit received an update request from client ");
    userDao.updateUserPass(req.params.id, req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.put("/Profile/updateUsername/:id", (req, res) => {
    console.log("/Profile/edit received an update request from client ");
    userDao.updateUserName(req.params.id, req.body, (status, data) => {
        res.status(status);
        res.json(data);
    })
});

app.post("/inviteUser", (req, res) => {
    let email: string = req.body.email;
    let org_id: number = req.body.org_id;
    let org_name: string = req.body.org_name;
    let token: string = jwt.sign({org_id: org_id, email: email}, privateKEY.key, {
        expiresIn: 3600
    });
    let url: string = DOMAIN + "#/user/" + token;

    let mailOptions = {
        from: "systemharmoni@gmail.com",
        to: email,
        subject: "Invitasjon fra " + org_name,
        text: "Besøk denne lenken for å godta invitasjonen: " + url
    };

    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log("Error: ", err);
        } else {
            console.log("Email sent!");
        }

        res.json(url);
    });
});

//ORGANIZATION
app.get("/organization/mail/:mail", (req: Request, res: Response) => {
    console.log("/test: received get request from client for organization by ID");
    organizationDAO.getOrgByUserEmail(req.params.mail, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/organization/id/:id", (req: Request, res: Response) => {
    console.log("/test: received get request from client for organization by ID");
    organizationDAO.getOrganization(req.params.id, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.get("/organization/all", (req: Request, res: Response) => {
    console.log("/test: received get request from client for all organizations");
    organizationDAO.getAllOrganizations((status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.post("/organization/add", (req: Request, res: Response) => {
    pool.getConnection((err, connection:

    function

) =>
    {
        console.log("Connected to database");
        if (err) {
            console.log("Feil ved oppkobling til databasen");
            res.json({error: "feil ved oppkobling"});
        } else {
            connection.query(
                "INSERT INTO organization(org_name, phone, email) VALUES (?,?,?)",
                [req.body.org_name, req.body.phone, req.body.email],
                err => {
                    if (err) {
                        console.log(err);
                        res.json({error: "error querying"});
                    } else {
                        connection.query(
                            "SELECT LAST_INSERT_ID() AS org_id",
                            (err, rows) => {
                                connection.release();
                                if (err) {
                                    console.log(err);
                                    res.json({error: "error querying"});
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
    }
)
    ;
});

app.delete("/organization/delete/:id", (req: Request, res: Response) => {
    console.log("/organization/delete/:id: received delete request from client");
    pool.getConnection((err, connection:

    function

) =>
    {
        console.log("Connected to database");
        if (err) {
            console.log("Feil ved kobling til databasen");
            res.json({error: "feil ved oppkobling"});
        } else {
            connection.query(
                "DELETE artist FROM artist INNER JOIN event ON artist.event_id = event.event_id WHERE org_id=?",
                [req.params.id],
                (err, rows) => {
                    if (err) {
                        console.log(err);
                        res.json({error: "error querying"});
                    } else {
                        connection.query(
                            "DELETE ticket FROM ticket INNER JOIN event ON ticket.event_id = event.event_id WHERE org_id=?",
                            [req.params.id],
                            (err, rows) => {
                                if (err) {
                                    console.log(err);
                                    res.json({error: "error querying"});
                                } else {
                                    connection.query(
                                        "DELETE user_event FROM user_event INNER JOIN event ON user_event.event_id = event.event_id WHERE org_id=?",
                                        [req.params.id],
                                        (err, rows) => {
                                            if (err) {
                                                console.log(err);
                                                res.json({error: "error querying"});
                                            } else {
                                                connection.query(
                                                    "DELETE FROM event WHERE org_id=?",
                                                    [req.params.id],
                                                    (err, rows) => {
                                                        if (err) {
                                                            console.log(err);
                                                            res.json({error: "error querying"});
                                                        } else {
                                                            connection.query(
                                                                "DELETE FROM user WHERE org_id=?",
                                                                [req.params.id],
                                                                (err, rows) => {
                                                                    connection.release();
                                                                    if (err) {
                                                                        console.log(err);
                                                                        res.json({error: "error querying"});
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
    }
)
    ;
});

app.put("/organization/edit/:id", (req: Request, res: Response) => {
    console.log("/test:received update request from user to update organization");
    organizationDAO.updateOrganization(req.params.id, req.body, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

//TOKEN
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

app.get("/generateInvToken/:org_id", (req, res) => {
    let token = jwt.sign({org_id: req.params.org_id}, privateKEY.key, {
        expiresIn: 3600
    });
    console.log("generated and sent token: " + token);
    res.json({jwt: token});
});

app.post("/invToken", (req, res) => {
    let token: string = req.headers["x-access-token"];
    jwt.verify(token, privateKEY.key, (err, decoded) => {
        if (err) {
            res.status(401);
            res.json({error: "Not Authorized"});
        } else {
            console.log("Token ok, returning org_id");
            console.log(decoded.org_id);
            console.log(decoded.email);
            res.json({"org_id": decoded.org_id, "email": decoded.email});
        }
    })
});

app.post("/resetToken", (req, res) => {
    let token: string = req.headers["x-access-token"];
    jwt.verify(token, privateKEY.key, (err, decoded) => {
        if (err) {
            res.status(401);
            res.json({error: "Not Authorized"});
        } else {
            console.log("Token ok, returning org_id and email");
            console.log(decoded.org_id);
            console.log(decoded.email);
            res.json({"org_id": decoded.org_id, "email": decoded.email});
        }
    })
});

app.post("/verifyToken", (req, res) => {
    let token: string = req.headers["x-access-token"];

    jwt.verify(token, privateKEY.key, (err, decoded) => {
        if (err) {
            res.status(401);
            res.json({error: "Not Authorized"});
        } else {
            console.log("Token ok, returning org_id and email");
            res.json({
                "org_name": decoded.org_name,
                "org_email": decoded.org_email,
                "org_phone": decoded.org_phone,
                "user_email": decoded.user_email,
                "user_privileges": decoded.user_privileges,
                "user_name": decoded.user_name,
                "user_password": decoded.user_password,
                "user_address": decoded.user_address,
                "user_phone": decoded.user_phone
            });
        }
    })
});

//OTHER
app.post("/bugreport", (req, res) => {
    let email: string = req.body.email;
    let org_id: number = req.body.org_id;
    let org_name: string = req.body.org_name;
    let report: string = req.body.text;
    let token: string = jwt.sign({org_id: org_id}, privateKEY.key, {
        expiresIn: 3600
    });
    let url: string = DOMAIN + "#/user/" + token;

    let mailOptions = {
        from: "systemharmoni@gmail.com",
        to: email,
        subject: "Bugreport fra " + org_name,
        text: report
    };

    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log("Error: ", err);
        } else {
            console.log("Email sent!");
        }

        res.json(url);
    });
});

app.post("/verifyEmail", (req, res) => {

    let org_name = req.body.org_name;
    let org_email = req.body.org_email;
    let org_phone = req.body.org_phone;
    let user_email = req.body.user_email;
    let user_privileges = req.body.user_privileges;
    let user_name = req.body.user_user_name;
    let user_password = req.body.user_password;
    let user_address = req.body.user_address;
    let user_phone = req.body.user_phone;

    let token: string = jwt.sign({
        org_name: org_name,
        org_email: org_email,
        org_phone: org_phone,
        user_email: user_email,
        user_privileges: user_privileges,
        user_name: user_name,
        user_password: user_password,
        user_address: user_address,
        user_phone: user_phone
    }, privateKEY.key, {
        expiresIn: 3600
    });
    let url: string = DOMAIN + "#/verifyEmail/" + token;

    let mailOptions = {
        from: "systemharmoni@gmail.com",
        to: user_email,
        subject: "Verifiser din e-post for admin bruker til organisasjonen " + org_name,
        text: "Verifiser din e-post her: " + url
    };

    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log("Error: ", err);
        } else {
            console.log("Email sent!");
        }

        res.json(url);
    });
});

app.post("/forgotPass", (req, res) => {
    let email: string = req.body.email;
    let org_id: number = req.body.org_id;
    let org_name: string = req.body.org_name;
    console.log(email);
    console.log(org_id);
    console.log(org_name);
    let token: string = jwt.sign({org_id: org_id, email: email}, privateKEY.key, {
        expiresIn: 3600
    });
    let url: string = DOMAIN + "#/resetPass/" + token;

    let mailOptions = {
        from: "systemharmoni@gmail.com",
        to: email,
        subject: "Gjenopprett passordet ditt til " + org_name,
        text: "Besøk denne lenken for å gjenopprette passordet ditt: " + url
    };

    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log("Error: ", err);
        } else {
            console.log("Email sent!");
        }

        res.json(url);
    });
});

/*app.use("/upload/",function (req, res, next: function) {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    console.log(req.files.myFile);

    let myFile = req.files.myFile;
    let fileName = Date.now() + "-" + myFile.name;

    myFile.mv(path.join(__dirname,'uploads/'+ Date.now() + "-" + myFile.name ), err=>{
        if(err)return res.status(500);
    });
    uploadFile(path.join(__dirname,'uploads/'+ fileName)).then(()=>{
        fs.unlinkSync(path.join(__dirname,'uploads/'+ fileName));
    });
    next();
});*/

app.put("/upload/Profile/editImage/:id", (req, res) => {
    console.log("/Profile/edit received an update request from client ");
    //const file = req.file;
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    console.log(req.files.myFile);

    let myFile = req.files.myFile;
    let fileName = Date.now() + "-" + myFile.name;

    myFile.mv(path.join(__dirname, 'uploads/' + Date.now() + "-" + myFile.name), err => {
        if (err) return res.status(500);
    });
    uploadFile(path.join(__dirname, 'uploads/' + fileName));

    userDao.updateUserImage(req.params.id, fileName, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.post("/upload/event/editImage/:id", (req, res) => {
    console.log("/Profile/edit received an update request from client ");
    //const file = req.file;
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    console.log(req.files.myFile);

    let myFile = req.files.myFile;
    let fileName = Date.now() + "-" + myFile.name;

    myFile.mv(path.join(__dirname, 'uploads/' + Date.now() + "-" + myFile.name), err => {
        if (err) return res.status(500);
    });
    uploadFile(path.join(__dirname, 'uploads/' + fileName));
    eventDao.updateEventImage(req.params.id, fileName, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.post("/upload/organization/editImage/:id", (req, res) => {
    console.log("/Profile/edit received an update request from client ");
    //const file = req.file;
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    console.log(req.files.myFile);

    let myFile = req.files.myFile;
    let fileName = Date.now() + "-" + myFile.name;

    myFile.mv(path.join(__dirname, 'uploads/' + Date.now() + "-" + myFile.name), err => {
        if (err) return res.status(500);
    });
    uploadFile(path.join(__dirname, 'uploads/' + fileName));
    organizationDAO.updateOrgImage(req.params.id, fileName, (status, data) => {
        res.status(status);
        res.json(data);
    });
});

app.post('/uploadfile', (req, res) => {
    //const file = req.file;
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }
    console.log(req.files.myFile);

    let myFile = req.files.myFile;

    myFile.mv(path.join(__dirname, 'uploads/' + Date.now() + "-" + myFile.name), err => {
        if (err) return res.status(500);
        res.json('File was uploaded');
    });

    /*sampleFile.mv('/somewhere/on/your/server/filename.jpg', function(err) {
        if (err)
            return res.status(500).send(err);

        res.send('File uploaded!');
    });*/
    /*if (!file) {
      const error = new Error('Please upload a file')
      error.httpStatusCode = 400
      return next(error)
    }*/
});


let server = app.listen(8080);
