import React from 'react';
import { compose, withStateHandlers } from "recompose";
import { InfoWindow, withGoogleMap, withScriptjs, GoogleMap, Marker } from 'react-google-maps';
import { Component } from "react-simplified";

let LAT: float = 0;
let LNG: float = 0;
let show: boolean = false;

export function getlatlng(){
  return [LAT, LNG];
}

const Map = compose(
    withStateHandlers(() => ({
        isMarkerShown: false,
        markerPosition: null
      }), {
        onMapClick: ({ isMarkerShown }) => (e) => ({
            markerPosition: e.latLng,
            isMarkerShown:true
        })
      }),
    withScriptjs,
    withGoogleMap
)
    (props =>
        <GoogleMap
            defaultZoom={13}
            defaultCenter={{ lat: LAT, lng: LNG }}
            onClick={(e) => {
            if (!show){
              props.onMapClick(e);
              LAT = e.latLng.lat();
              LNG = e.latLng.lng();
            }}}
        >

        {(show ? <Marker position={{lat: LAT, lng: LNG}}/> : <></>)}
            {props.isMarkerShown && <Marker position={props.markerPosition} />}
        </GoogleMap>
    )

export default class MapContainer extends Component<{lat?: float, lng?: float, show: boolean}> {
    constructor(props) {
        super(props);
        LAT = this.props.lat || 63.43049 ;
        LNG = this.props.lng || 10.39506;
        show = this.props.show;
    }

    render() {
        return (
            <div style={{ height: '100%' }}>
                <Map
                    googleMapURL="https://maps.googleapis.com/maps/api/js?key=AIzaSyCyYQy7LmG8h3r4M8CEDiy1SGBHJ_4QUrI"
                    loadingElement={<div style={{ height: `100%` }} />}
                    containerElement={<div style={{ height: `400px` }} />}
                    mapElement={<div style={{ height: `100%` }} />}
                    onClick={() => console.log("hei")}
                />
            </div>
        )
    }

    mounted() {
      //this.position = Map.props.markerPosition;
    }
}
