import axios from 'axios';


export default axios.create({
  baseURL: 'http://localhost:3889/api', 
  withCredentials: true,
});