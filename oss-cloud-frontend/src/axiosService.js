import axios from "axios";

const addContributorURL = "http://localhost:3000/addContributor";
const getAllContributorsURL = "http://localhost:3000/contributors";

export const addContributorAxios = contributor => {
  return axios({
    method: "post",
    url: addContributorURL,
    data: contributor
  });
};

export const loadContributorsAxios = () => {
  return axios({
    method: "get",
    url: getAllContributorsURL
  });
};
