import { Component, View } from 'angular2/core';
import { Router, RouterLink } from 'angular2/router';
import { CORE_DIRECTIVES, FORM_DIRECTIVES } from 'angular2/common';
import { Http, Headers } from 'angular2/http';
import { contentHeaders } from '../common/headers';
// import { App } from '../app/App';


let styles   = require('./login.css');
let template = require('./login.html');

@Component({
  selector: 'login'
})
@View({
  directives: [RouterLink, CORE_DIRECTIVES, FORM_DIRECTIVES ],
  template: template,
  styles: [ styles ]
})

export class Login {

  constructor(public router: Router, public http: Http) {
  }

  login(event, username, password) {
    event.preventDefault();
    let mode = 'mobile';
    let body = JSON.stringify({ username, password, mode });
    this.http.post('http://localhost:3001/api/login', body , { headers: contentHeaders })
      .subscribe(
        response => {
          localStorage.setItem('jwt', response.json().id_token);
          if (response.json().message === 'Authentication OK.') {
            localStorage.setItem('username', response.json().user);
            alert(response.json().user);
            this.router.parent.navigateByUrl('/home');
          }else {
            alert(response.json().message);
          }
          // this.router.parent.navigateByUrl('/home');
          // console.log('response '+response);
        },
        error => {
          alert(error.text());
          console.log(error.text());
        }
      );
  }

  signup(event) {
    event.preventDefault();
    this.router.parent.navigateByUrl('/signup');
  }
}
