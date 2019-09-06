import axios from "axios";

const baseURL = "http://localhost:3000";

const addContributorURL = baseURL + "/addContributor";
const getAllContributorsURL = baseURL + "/contributors";
const contributionsURL = baseURL + "/contributions";
const updateContributionStatusURL = baseURL + "/contributionStatus";
const loadContributorVisibleContributionsURL = baseURL + "/contributorVisible";

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

export const loadContributionsAxios = () => {
  return axios({
    method: "get",
    url: contributionsURL
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
    method: "post",
    url: loadContributorVisibleContributionsURL,
    data: {
      username
    }
  });
};
