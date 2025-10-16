import './App.css'
import RoutesConfig from './routes';
import {setupAxiosInterceptors} from "./api/http"


export default function App() {

  setupAxiosInterceptors()
  return (
    <RoutesConfig />
  );
}
