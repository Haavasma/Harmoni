//@flow

import * as React from 'react';
import { Component } from "react-simplified";

export class RegistrationForm extends Component {
    render(){
        return(
            <div>
                <h2 className="card-header">Opprett nytt arrangement</h2>
                <form className="card-body">
                    <div className="form-group">
                        <label>Arrangement Navn:</label>
                        <input className="form-control" placeholder="skriv inn navn her"/>
                    </div>
                    <div className="form-group">
                        <label>Lokasjon:</label>
                        <input className="form-control" placeholder="Skriv inn addresse"/>
                    </div>
                    <div className="form-inline">
                        <div className="row">
                            <div className="col">
                                <label>Start dato:</label>
                                <input className="form-control" type="date"/>
                            </div>
                            <div className="col">
                                <label>Start tid:</label>
                                <input className="form-control" type="time"/>
                            </div>
                            <div className="col">
                                <label>Slutt dato:</label>
                                <input className="form-control" type="date"/>
                            </div>
                            <div className="col">
                                <label>Slutt tid:</label>
                                <input className="form-control" type="time"/>
                            </div>
                        </div>
                    </div>
                    <div className="form-group">
                        <h4>Legg til artist...</h4>
                    </div>
                </form>
            </div>
        )
    }
}
