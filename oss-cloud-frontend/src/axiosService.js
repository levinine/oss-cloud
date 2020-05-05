import axios from "axios";
import { Auth } from "aws-amplify";

const baseURL = "https://iwjed2tc7a.execute-api.eu-west-1.amazonaws.com/prod";

const addContributorURL = baseURL + "/addContributor";
const getAllContributorsURL = baseURL + "/contributors";
const contributionsURL = baseURL + "/contributions";
const updateContributionStatusURL = baseURL + "/contributionStatus";
const loadContributorVisibleContributionsURL = baseURL + "/contributorVisible";

axios.interceptors.request.use(
  async function(config) {
    let token;
    try {
      const session = await Auth.currentSession();
      token = session.idToken;
    } catch (e) {
      token = undefined;
    }
    if (token != undefined)
      config.headers["Authorization"] = `Bearer ${token.jwtToken}`;
    return config;
  },
  function(error) {
    return Promise.reject(error);
  }
);

export const addContributorAxios = contributor => {
  return axios({
    method: "post",
    url: addContributorURL,
    data: contributor
  });
};

export const loadContributorsAxios = options => {
  return axios({
    method: "get",
    url: getAllContributorsURL,
    params: options
  });
};

export const loadContributionsAxios = options => {
  return axios({
    method: "get",
    url: contributionsURL,
    params: options
  });
};

export const updateContributionStatus = (status, contribution) => {
  return axios({
    method: "post",
    url: updateContributionStatusURL,
    data: {
      status,
      contribution
    }
  });
};

export const loadContributorVisibleContributions = username => {
  return axios({
    method: "get",
    url: loadContributorVisibleContributionsURL,
    params: {
      username
    }
  });
};
