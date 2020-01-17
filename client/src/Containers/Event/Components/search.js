import * as React from 'react';
import {Component} from "react-simplified";
import {eventService} from "../../../services/EventService";
import {Column} from "../../../widgets";
import Card from "react-bootstrap/Card";
import {Col, Container, Image, ListGroup, ListGroupItem, Nav, Row} from "react-bootstrap";

export class SearchResults extends Component <{match: {params: {search: string}}}> {
    events: Event[] | any = [];
    /*.substring(0,20) + "..."*/

    render() {
        return(
            <div className="searchResults">
                <Container style={{padding:0}}>
                    <div className="card-header" style={{color:'white', backgroundColor:'#53265F'}}><h4> Søkeresultater for: {this.props.match.params.search}</h4></div>
                    {this.events.map(e => (
                        <div style={{maxHeight:100+'%'}}>
                                <ListGroup>
                                    <ListGroupItem style={{width:100+'%', height: "200px", padding:0}} >
                                        <div className="row" style={{paddingLeft: 15+"px", paddingRight: 15+"px"}}>
                                            <div className="col-5" style={{padding:0}}>
                                                <Image src="https://kampanje.com/contentassets/0c30c67529294a8c8e59d84740c27e90/eventbilde-sponsor-og-event.jpg?width=1600&height=1300&mode=carve"
                                                       height="200px" width="300px" style={{objectFit: "cover"}}/>
                                            </div>
                                            <div className="col-7" style={{padding:0}}>
                                                <p style={{color: "#D35400", fontSize: '25px', fontWeight:"bold"}}>Arrangement start: {e.event_start.slice(8,10) + "." + e.event_start.slice(5,7) +"." + e.event_start.slice(0,4)
                                                +  " kl: "+ e.event_start.slice(11,16)}</p>
                                                <Nav.Link href={"#/showEvent/" + e.event_id} style={{padding: 0}}><p style={{color:'black', fontSize:'40px', fontWeight: "bold"}}>{e.event_name}</p></Nav.Link>
                                                <p style={{color:'black', fontSize:'20px'}}>{(e.place)}</p>
                                            </div>
                                        </div>
                                    </ListGroupItem>
                                </ListGroup>
                        </div>
                    ))}
                </Container>
            </div>
        );
    }

    mounted(){
        eventService.getEventbySearch(this.props.match.params.search)
            .then(event => this.events = event)
            .then(console.log(this.events))
            .catch((error: Error) => console.log(error.message));
    }
}