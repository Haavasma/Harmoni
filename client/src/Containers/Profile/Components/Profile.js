//@flow

import * as React from 'react';
import {Component} from 'react-simplified';
import { Nav, Image, Tab, Col, Spinner, Button, Card, Container } from 'react-bootstrap';
import { User, userService } from '../../../services/UserService';
import { createHashHistory } from 'history';
import {Row, Alert} from '../../../widgets';
import {sharedComponentData} from 'react-simplified';
import Form from 'react-bootstrap/Form';
import "./Profile.css";

const history = createHashHistory();
let emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export class Profile extends Component{
  user: User = new User();
  hidden: boolean = true;
  repeatedPassword: string = "";
  imageFile: File = null;

  render() {
    if (userService.currentUser) {
      return (
        <div className="container-fluid">
          <div className="container">
            <div>
              <h3 style={{margin:5 + '%'}}>Hei, {userService.currentUser.user_name}!</h3>
            </div>
          </div>

        <div className="container">
          <Tab.Container  defaultActiveKey="first">
            <Row>
              <div className="col-lg-3">
                <div className="container">
                  <div id ="card-img">
                    <Image src={userService.currentUser.image ? userService.currentUser.image : "https://www.simplifai.ai/wp-content/uploads/2019/06/blank-profile-picture-973460_960_720-400x400.png"}
                           roundedCircle width={240 + 'px'}
                           height={220 + 'px'}
                           style={{marginTop: 10 + 'px' ,marginBottom: 20 +'px'}}/>
                           <br/>
                           <br/>
                  </div>

                  <div className="form-inline-block">
                      <Nav variant="pills" className="flex-column" >
                        <Nav.Item>
                          <Nav.Link eventKey="first">Bruker informasjon</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link eventKey="second">Endre brukernavn og/eller passord</Nav.Link>
                        </Nav.Item>
                        <Nav.Item>
                          <Nav.Link eventKey="third">Slett brukerkonto</Nav.Link>
                        </Nav.Item>
                        <br/>
                        <text> Harmoni bruker siden {userService.currentUser.reg_date.slice(8,10) +"/" + userService.currentUser.reg_date.slice(5,7) +"-" + userService.currentUser.reg_date.slice(0,4)}</text>
                      </Nav>
                  </div>
                </div>
              </div>


            <div className="col-lg-9" style={{paddingLeft: '5%'}}>
              <div id="hi">
              <div>
                <Tab.Pane eventKey="first">
                  <Card>
                    <div className="card-body">
                      <h2>Profil instillinger</h2>
                      <br/>
                      <h6>Email knyttet til bruker: </h6>
                    <br/>
                      <p style={{color:'white', textAlign: 'center', fontWeight: 'bold'}}>{userService.currentUser.email}</p>
                      <br/>
                      <br/>
                      <h3>Endre profilbilde</h3>
                      <Form.Group>
                          <Form.Label>Last opp bilde</Form.Label>
                          <Form.Control accept = "image/*" type="file" onChange = {(event: SyntheticInputEvent <HTMLInputElement>) => {this.user.image =
                            event.target.files[0]}}/>
                      </Form.Group>
                      <Button variant="primary" type="submit" style={{marginTop: 20 + 'px'}} onClick={this.changePB}>Endre</Button>
                      <br/>
                      <br/>
                      <h3>Kontakt informasjon</h3>
                      <Form.Group>
                        <Form.Label>Endre adresse</Form.Label>
                        <Form.Control type="address" placeholder={userService.currentUser.address} onChange={(event: SyntheticInputEvent<HTMLInputElement>) => {
                          this.user.address = event.target.value
                        }}/>
                      </Form.Group>
                      <Form.Group>
                        <Form.Label>Endre telefon</Form.Label>
                        <Form.Control type="number" placeholder={userService.currentUser.phone} onChange={(event: SyntheticInputEvent<HTMLInputElement>) => {
                          this.user.phone = event.target.value
                        }}/>
                      </Form.Group>
                      <Button variant="primary" type="submit" style={{marginTop: 20 + 'px'}} onClick={this.changeInfo}>Endre</Button>
                    </div>
                  </Card>
                </Tab.Pane>
                <Tab.Pane eventKey="second">
                 <Card>
                   <Card.Body>
                     <h2>Endre brukernavn og/eller passord</h2>
                     <p>(La felt stå tomt om det ikke skal endres)</p>
                     <Form.Group>
                       <Form.Label>Endre brukernavn</Form.Label>
                       <Form.Control type="username" placeholder={userService.currentUser.user_name} onChange={(event: SyntheticInputEvent<HTMLInputElement>) => {
                         this.user.user_name = event.target.value
                       }}/>
                     </Form.Group>
                     <Form.Row>
                       <Form.Group as={Col}>
                         <Form.Label>Endre passord</Form.Label>
                         <Form.Control type="password" placeholder="Skriv inn nytt passord"onChange={(event: SyntheticInputEvent<HTMLInputElement>) => {
                           this.user.password = event.target.value;
                         }}/>

                       </Form.Group>
                       <Form.Group as={Col}>
                         <Form.Label>Bekreft passord</Form.Label>
                         <Form.Control type="password" placeholder="Gjenta passord"
                                       onChange={(event: SyntheticInputEvent<HTMLInputElement>) => {
                           this.repeatedPassword = event.target.value
                         }}/>
                       </Form.Group>
                     </Form.Row>
                     <Button type="submit" variant="primary" onClick = {this.changeUP}>Endre</Button>
                   </Card.Body>
                 </Card>
                </Tab.Pane>
                <Tab.Pane eventKey="third">
                 <Card>
                   <Card.Body>
                     <h2>Slett brukeren din</h2>
                     <Button type="submit" variant="danger" onClick = {this.delete}>Slett bruker</Button>
                     <Button type="submit" variant="secondary" onClick = {this.cancel}>Angre</Button>

                   </Card.Body>
                 </Card>
                </Tab.Pane>
              </div>
              </div>
            </div>
            </Row>
          </Tab.Container>
          </div>
        </div>
      )
    } else {
      return <Spinner animation="border"/>
    }
  }

  // Change profile picture
  changePB(){
    console.log("BILDE: ", this.user.image);
      userService
        .addProfilePicture(userService.currentUser.user_id, this.user.image)
        .then(() => {
          if(userService.currentUser){
            Alert.success("Profilbildet er oppdatert");
            userService.autoLogin();
            window.location.reload()
          }
        })

  }
  // Change info
  changeInfo(){
    if(this.user.address.length !==0 || this.user.phone.length !==0){
      if(this.user.address.length == 0){
        this.user.address = userService.currentUser.address;
      }else if(this.user.phone.length == 0){
        this.user.phone = userService.currentUser.phone;
      }
      userService
        .updateInfo(userService.currentUser.user_id, this.user.address, this.user.phone)
        .then(() => {
          if(userService.currentUser){
            Alert.success("Kontaktinfo er oppdatert ");
            userService.autoLogin();
            history.push("/Profile");
          }
        })
    }
  }
  // Change username and password
  changeUP() {
    if(this.repeatedPassword.length == 0 && this.user.user_name.length>=1){
      userService.updateUserName(userService.currentUser.user_id, this.user.user_name)
          .then(()=>{
            Alert.success("Brukernavn endret");
            userService.autoLogin();
            history.push("/Profile")
          })
    }
    else if (this.repeatedPassword != this.user.password || this.user.password.length < 8) {
      Alert.danger("Passord må være like og ha minst 8 tegn");
    }else if (this.user.user_name.length !== 0 && this.repeatedPassword == this.user.password && this.user.password.length >=8) {
      userService
        .updateUsernamePassword(userService.currentUser.user_id, this.user.user_name, this.user.password)
        .then(() => {
          if (userService.currentUser) {
            Alert.success("Brukernavn OG passord er oppdatert");
            userService.autoLogin();
            history.push("/Profile");
          }
        })
    }else if(this.user.user_name.length == 0 &&this.repeatedPassword == this.user.password && this.user.password >=8){
      userService.updateUsernamePassword(userService.currentUser.user_id, userService.currentUser.user_name, this.user.password)
          .then(()=>{
            Alert.success("Passord oppdatert");
            userService.autoLogin();
            history.push("/Profile");
          }).catch((error: Error) =>{
            Alert.danger(error.message);
      })
    }
  }

  //delete user
  delete(){
    console.log(userService.currentUser.user_id);
    userService
      .deleteUser(userService.currentUser.user_id)
      .then(() => {
        localStorage.setItem("token", "");
        if(userService.currentUser){
          userService.currentUser = null;
          Alert.success("Sletting gikk fint");
          history.push("/login");
        }
      })
  }

  // Cancel user deletion
  cancel(){
    Alert.info("Bruker ble ikke slettet");
    history.push("/allEvents");

  }
}