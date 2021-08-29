import snakecaseKeys from 'snakecase-keys';
import camelcaseKeys from 'camelcase-keys';
import { matchPath } from "react-router";
import { URL_COMPANY_PREFIX } from '../Constants';

const API_PORT = 5000;
const API_HOST = 'http://localhost';
const SOCKET_PORT = 'ws://localhost';

class BaseService {
  static getCompanySlug(){
    let match = matchPath(window.location.pathname, {
      path: `/${URL_COMPANY_PREFIX}/:companySlug`,
      exact: false,
      strict: false
    });

    if(match){
      return match.params.companySlug;
    }

    throw new Error('Cannot get company slug.');
  }

  static fetchAux(){
    return fetch(...arguments)
    .then(res => {
      if(res.ok){
        return res.json()
      }
      throw res;
    })
    .then(res => camelcaseKeys(res, { deep: true }));
  }

  // Adds the company slug to create company-scoped queries.
  static fetchWithCompanyScope(){
    arguments[0] = `${API_HOST}:${API_PORT}/companies/${BaseService.getCompanySlug()}${arguments[0]}`;
    return BaseService.fetchAux(...arguments);
  }

  // Fetch without any company slug.
  // TODO: If necessary, create get/post/put/delete without company scope. The one WITH company scope already
  // has those methods implemented.
  static fetchOutsideCompanyScope(){
    arguments[0] = `${API_HOST}:${API_PORT}${arguments[0]}`;
    return BaseService.fetchAux(...arguments);
  }
  

  static get(url, queryParams = {}){
    queryParams = snakecaseKeys(queryParams, { deep: true });
    let queryString = new URLSearchParams(queryParams).toString();

    if(queryString.length > 0){
      url = `${url}?${queryString}`;
    }

    return BaseService.fetchWithCompanyScope(url);
  }

  static put(url, data){
    return BaseService.sendWithData(url, 'put', data);
  }

  static post(url, data){
    return BaseService.sendWithData(url, 'post', data);
  }

  static delete(url, data){
    return BaseService.sendWithData(url, 'delete', data);
  }

  static sendWithData(url, method, data = null){
    let headers = {
      method,
      headers: { 'Content-Type': 'application/json' }
    }
    if(data !== null){
      headers.body = JSON.stringify(snakecaseKeys(data, { deep: true }));
    }
    return BaseService.fetchWithCompanyScope(url, headers);
  }

  static socketEndpoint(){
    return `${SOCKET_PORT}:${API_PORT}/cable`;
  }
}

export default BaseService;
