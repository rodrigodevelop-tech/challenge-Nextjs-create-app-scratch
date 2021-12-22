import { NextApiRequest, NextApiResponse } from 'next';

const url= require('url');

export default async function exit(req : NextApiRequest,res : NextApiResponse){

  res.clearPreviewData();

  const queryObject = url.parse(req.url, true).query;
  const redirectUrl = queryObject && queryObject.currentUrl ? queryObject.currentUrl : '/';

  res.writeHead(307, { Location: redirectUrl });
  res.end();

}
