# Open-Source Software Cloud

Open-source software cloud is an application designed to track and show open-source contributions of stored contributors.

An instance of this project is currently running at [https://oss.levi9.com](https://oss.levi9.com)

This project was made using the [serverless](https://serverless.com) framework with AWS, Node.js and Vue.js.


## Prerequisites

- Node.js 8+
- AWS cli
- AWS account

## Setup and running

Before starting the project, setup your aws [credentials](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html)

Setup a MySQL database. 

Create a [GitHub App](https://developer.github.com/apps/building-github-apps/creating-a-github-app/) and install it for at least one user/organisation. Your app URL and webhook URL are not important. The app is only used for its credentials.

Create a user pool using AWS Cognito.

Setup the following parameters on SSM Paramter store (make sure the type is SecureString):

- MYSQL\_ENDPOINT
- MYSQL\_PORT
- MYSQL\_DATABASE
- MYSQL\_USER
- MYSQL\_PASSWORD
- GITHUB\_APP\_ID
- GITHUB\_APP\_PRIVATE\_KEY
- GITHUB\_APP\_INSTALLATION\_ID
- AUTH\_REGION
- AUTH\_AWS_ACCOUNT\_ID
- AUTH\_USER\_POOL\_ID

### Back-end

From _oss-cloud-backend_ directory run:
```
npm install
sls deploy -s DESIRED_STAGE
```

### Front-end

You will need an S3 bucket on your aws account. To create one, run:
`aws s3 mb s3://name-your-bucket`

Replace baseURL in axiosService.js with your base lambda URL.

Set cognito user pool config in main.js file.

From _oss-could-frontend_ directory run:
```
npm install
npm run build
aws s3 cp ./dist s3://name-of-your-bucket --recursive
aws s3 website s3://name-of-your-bucket/ --index-document index.html
```

Your site will be hosted on http://name-of-your-bucket.s3-website-us-west-2.amazonaws.com

To make site accessible, bucket policy and bucket cors should be set. Configuration can be find in files `bucket-policy.json` and `bucket-cors-configuration.xml`

### Storing networking SSM parameters

There are several important SSM parameters.

List of all networking parameters are listed bellow:

`/NETWORKING/oss-infrastructure-prod/DBSubnets` <br/>
`/NETWORKING/oss-infrastructure-prod/DbSecurityGroup` <br/>
`/NETWORKING/oss-infrastructure-prod/LambdaSecurityGroup` <br/>
`/NETWORKING/oss-infrastructure-prod/LambdaSubnets` <br/>
`/NETWORKING/oss-infrastructure-prod/PublicSubnets` <br/>
`/NETWORKING/oss-infrastructure-prod/RDSSubnetGroup` <br/>
`/NETWORKING/oss-infrastructure-prod/VPC` <br/>

In order to store all lambda functions inside custom VPC, in the VPC section we need to declare subnets and security group for lambda.

It should look simmilar to this:

```
vpc:
      securityGroupIds:
        - securityGroupId1
        - securityGroupId2
      subnetIds:
        - subnetId1
        - subnetId2
```
Since we want to store all lambda functions in specific subnet and security group, in this VPC section we'll use these parameters: 

`/NETWORKING/oss-infrastructure-prod/LambdaSecurityGroup` <br/>
`/NETWORKING/oss-infrastructure-prod/LambdaSubnets` .

## Possible Improvements

- Increase GitHub Api rate limits. Currently there is a limit of 30 requests per minute, which means 29 forked repositories per contributor.
- Overall UI improvements. (Prettier front page, support for mobile)
- Additional functionalities for handling contributors as an administrator
-- Manage all users, at the moment ones without forks are invisible
-- Bulk change users
- Displaying more information about contributions. (Show whether it is open/closed, merged, etc.)
- Support contributions made under organization account
