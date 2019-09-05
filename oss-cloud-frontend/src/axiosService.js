import axios from "axios";

const addContributorURL = "http://localhost:3000/addContributor";
const getAllContributorsURL = "http://localhost:3000/contributors";
const contributionsURL = "http://localhost:3000/contributions";
const updateContributionStatusURL = "http://localhost:3000/contributionStatus"

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

export const loadContributionsAxios = () => {
  return axios({
    method: 'get',
    url: contributionsURL,
  })
}

export const updateContributionStatus = (status, contribution) => {
  return axios({
    method: 'post',
    url: updateContributionStatusURL,
    data: {
      status,
      contribution
    }
  })
}
