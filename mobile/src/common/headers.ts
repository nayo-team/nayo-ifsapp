import { Headers } from 'angular2/http';

export const contentHeaders = new Headers();
contentHeaders.append('Accept', 'application/json');
contentHeaders.append('Content-Type', 'application/json');
// contentHeaders.append('Access-Control-Allow-Origin','http://localhost:38081/');
