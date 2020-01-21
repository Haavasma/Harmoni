import * as React from 'react';
import { Component } from "react-simplified";
import {EventService} from '../../../services/EventService';
import {Event} from "../../../services/EventService.js";
import { Alert, Card, NavBar, Button, Row, Column } from '../../../widgets.js';
import {NavLink} from "react-router-dom";
import MapContainer from "./map";
import Popup from "reactjs-popup";
import { createHashHistory } from 'history';
import {ticketService} from "../../../services/TicketService";
import axios from "axios";
import {Artist, artistService} from "../../../services/ArtistService";
import {userService} from "../../../services/UserService";
import {userEventService} from "../../../services/UserEventService";
import "./event.css";
import {organizationService} from "../../../services/OrganizationService";
import * as pdfMake from "pdfmake";

const history = createHashHistory();
let eventService = new EventService();

export class EventDetails extends Component<{ match: { params: { id: number } } }>  {
    event_id = this.props.match.params.id;
    loaded = [false, false, false, false];
    hidden: boolean = true;
    bugreport: string = "";

    constructor(props){
        super(props);
        this.state = {
            event: [],
            users: [],
            tickets: [],
            artists: []
        };
    }
    render() {
        if (this.loaded.some(l => !l)) {
            this.load();
            return <div/>
        }
        else {
            let e: Event = this.state["event"];
            console.log(this.state["artists"]);
            return (
                <div className={"w-50 mx-auto shadow-lg mt-4"}>
                    <div className="card card-cascade wider reverse C">
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"/>
                        <link href="https://fonts.googleapis.com/css?family=PT+Serif|Ubuntu&display=swap" rel="stylesheet"/>
                        <div className="view view-cascade overlay">
                            <img className="card-img-top shadow-lg"
                                 src="https://mdbootstrap.com/img/Photos/Slides/img%20(70).jpg"
                                 alt="Card image cap"></img>
                            <a href="#!">
                                <div className="mask rgba-white-slight"></div>
                            </a>
                        </div>

                        <br/>
                        <Row>
                            <Column width="10">
                                <div id="topBanner" className={"artistBanner w-100" + (false ? " greenBG" : " redBG")}> 
                                    Arrangementet er under planlegging
                                </div>
                            </Column>
                            <Column width="2">
                                
                            </Column>
                        </Row>
                        <div className="card-body card-body-cascade text-center">
                            <h1 className="card-title text">{e.event_name}</h1>

                            <h6 className="font-weight-bold indigo-text py-2">{e.place}</h6>
                            <h6 className="card-subtitle mb-2 text-muted"> <b></b> {e.event_start.slice(0, 10)}, {e.event_start.slice(11, 16)}-{e.event_end.slice(11, 16)}</h6>
                            <p className="card-text">{e.description}</p>
                            <br/>
                            <br/>
                            <p>Du kan akseptere din stilling i vaktlisten nedenfor.</p>
                            <br/>
                            <br/>
                            <h2 className={"text"}>Artister</h2>
                            <br/>
                            <Row className={"artistContainer"}>
                                {this.state["artists"].map(a =>
                                    <Column className="card artist" width={6}>
                                        <div className="card-body artist shadow-lg artistCard">
                                            <div className={"artistBanner" + (a.accepted === 1 ? " greenBG" : " redBG")}/>
                                            <h5 className="card-title">{a.artist_name}</h5>
                                            <p className="card-text">
                                                <h6> Epost: {a.email}</h6>
                                                <h6> tlf: {a.phone} </h6>
                                            </p>

                                            {a.riders ? <a href={window.URL.createObjectURL(a.riders)} download>{a.riders.name}</a>: 'Ingen rider valgt.'}
                                            <br/>

                                            <div className={"buttonContainer"}>
                                                <div className="artistButton" onClick={() => this.acceptArtist(a.artist_id, 0)}>
                                                    <button id="bot" type="button" className="btn btn-info btn-circle">
                                                        <i className="fa fa-times" ></i>
                                                    </button>
                                                </div>
                                                <div className= "artistButton px-1" onClick={() => this.acceptArtist(a.artist_id, 1)}>
                                                    <button id="top" type="button" className="btn btn-info btn-circle">
                                                        <i className="fa fa-check" ></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </Column>
                                )}
                            </Row>
                            <br/>
                            <h2 className={"text"}>Billetter</h2>
                            <br/>
                            <Row className={"ticketContainer"}>
                                {this.state["tickets"].map(t =>
                                    <Column className="card artist" width={6}>
                                        <div className="card-body artist shadow-lg">
                                            <h5 className="card-title">{t.ticket_type}</h5>
                                            <p className="card-text">
                                                <h6>{t.description}</h6>
                                                <h6>Pris: {t.price}</h6>
                                                <h6>Antall: {t.amount_sold}</h6>
                                            </p>
                                        </div>
                                    </Column>
                                )}
                            </Row>
                            <br/>

                            <a href={"#/editEvent/"+this.event_id} className="card-link">Rediger</a>
                            <Popup trigger = {<a className="card-link">Slett</a>} >
                                { close => (
                                    <div>
                                        <p><b>Vil du slette dette arrangementet?</b></p>
                                        <button className="btn btn-warning float-left ml-3" onClick={() => {close();}}>Nei</button>
                                        <button className="btn btn-success float-right mr-3" onClick={() => this.slett(this.event_id)}>Ja</button>
                                    </div>
                                )}
                            </Popup>
                            <a href={"#/showEvent/" + this.event_id} className="card-link" onClick={this.show}> Rapporter problem
                                <div hidden={this.hidden}>
                                    <textarea rows="4" cols="40" style={{margin: '10px',}} placeholder="Beskriv feilmelding"
                                              onChange={(event: SyntheticInputEvent<HTMLInputElement>) => (this.bugreport = event.target.value)}/>
                                    <br/>
                                    <button className="btn btn-primary submit" style={{margin:10 +'px'}} onClick={this.sendReport}>Rapporter problem</button>
                                </div>
                            </a>

                            <h2 className={"text"}>Vakter</h2>
                            <br/>
                            <table className={"table shadow-lg text"}>
                                <thead className="tableHead">
                                <tr>
                                    <th scope="col" className={"nameCol"}>Navn</th>
                                    <th scope="col" className={"positionCol"}>Stilling</th>
                                    <th scope="col" className={"buttonCol"}></th>
                                </tr>
                                </thead>

                                <tbody>
                                {this.state["users"].map(row =>
                                    <tr className={(row.accepted === 1 ? "greenBG" : "") + (row.accepted === 0 ? "redBG" : "")}>
                                        <td className={"borderControl"}>{row.user_name}</td>
                                        <td>{row.job_position}
                                        </td>
                                        {this.getUserEvent(row.user_id) ?
                                            <td className={"noBorder"}>
                                                <div className="buttonHorizontal" onClick={() => this.setAccepted(userService.currentUser.user_id, e.event_id, 0)}>
                                                    <button id="bot" type="button" className="btn btn-info btn-circle">
                                                        <i className="fa fa-times" ></i>
                                                    </button>
                                                </div>
                                                <div className= "buttonHorizontal px-1" onClick={() => this.setAccepted(userService.currentUser.user_id, e.event_id, 1)}>
                                                    <button id="top" type="button" className="btn btn-info btn-circle">
                                                        <i className="fa fa-check" ></i>
                                                    </button>
                                                </div>
                                            </td> : <div/>}
                                    </tr>
                                )}
                                </tbody>
                            </table>

                            <br/>
                            <h2 className={"text"}>Kart</h2>
                            <br/>
                            <MapContainer lat={e.latitude} lng={e.longitude} show={true}/>
                            <br/>

                        </div>
                    </div>
                </div>
            );
        }
    }
    load() {
        if (userService.currentUser) {
            eventService.getEventId(this.event_id).then(r => {
                let event = r;
                this.setState({event});
                this.loaded[0] = true;
            });

            ticketService.getEventTickets(this.event_id).then(r => {
                let tickets = r;
                this.setState({tickets});
                this.loaded[1] = true;
            });

            artistService.getEventArtists(this.event_id).then(r => {
                let artists = r;
                this.setState({artists});
                this.state.artists.map(a=>{
                    console.log("Artist: "+a.artist_id);
                    artistService.getArtistRider(a.artist_id).then(res =>{
                        a.riders= new File(res.data.data, res.name,{type: res.data.type});
                        console.log(a.riders);
                        this.setState({artists});
                    });
                });
                this.loaded[2] = true;
            });

            userEventService.getAllbyId(this.event_id).then( res => {
                let users = res;
                this.setState({users});
                this.loaded[3] = true;
            });

        }
    }

    setAccepted(user_id: number, event_id: number, accepted: number) {
        userEventService.setAccepted(user_id, event_id, accepted);
        let users = this.state["users"];

        users = users.map(u => {
            if (u.user_id === user_id) {
                u.accepted = accepted;
            }
            return u;
        });
        this.setState({users});
    }

    acceptArtist(id: number, accepted: number){
        artistService.setAccepted(id, accepted);

        let artists: Artist[] = this.state["artists"];
        artists = artists.map(a => {
            if (a.artist_id === id) {
                a.accepted = accepted;
            }
            return a;
        });
        this.setState({artists});
    }

    getUserEvent(BANG){
        if (userService.currentUser){
            let u = this.state["users"];

            if (u.length > 0){
                return u.find(user => userService.currentUser.user_id === BANG);
            }
            return undefined;
        }
        return undefined;
    }
    slett(event_id: number){
        eventService
            .deleteEvent(event_id)
            .then(response => console.log(response))
            .then(() => history.push("/allEvents"))
            .then(Alert.danger("Arrangementet ble slettet"))
            .catch((error: Error) => console.log(error.message));
    }
    show(){
        this.hidden = false;
    }

    sendReport(){
        organizationService.reportBug("pernilko@stud.ntnu.no", userService.currentUser.org_id, organizationService.currentOrganization.org_name, this.bugreport)
            .then((e) => {
                Alert.success("Bug report sendt!");
                this.hidden = true;
                this.email = "";
            })
            .catch((error: Error) => console.log(error.message))
    }
}
// <MapContainer lat={this.state["event"].latitude} lng={this.state["event"].longitude}/>