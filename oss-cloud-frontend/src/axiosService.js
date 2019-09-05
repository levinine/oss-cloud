import axios from "axios";

const addContributorURL = "http://localhost:3000/addContributor";
const getAllContributorsURL = "http://localhost:3000/contributors";
const contributionsURL = "http://localhost:3000/contributions";

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
