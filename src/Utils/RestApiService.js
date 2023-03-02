  
  export async function sendPostRequestWithAccessToken(url, accessToken){
    console.log('url: ', url);
    console.log('accessToken: ', accessToken);
    let responses = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken
      },
      //body:JSON.stringify(body),
    }).then((response) => 
    {
        return response.json()
    })
    .catch((error) => {
      console.error('error', error);
      return error;
    });
    return responses;
  }

  export async function sendPostRequestWithAccessTokenAndBody(url, body, accessToken){
    console.log('url: ', url);
    console.log('body: ', JSON.stringify(body));
    console.log('accessToken: ', accessToken);
    let responses = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken
      },
      body:JSON.stringify(body),
    }).then((response) => 
    {
        return response.json()
    })
    .catch((error) => {
      console.error('error', error);
      return error;
    });
    return responses;
  }



  export async function sendPostRequest(url, body){
    console.log('url: ', url);
    console.log('body: ', body);
    let responses = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body:JSON.stringify(body),
    }).then((response) => 
    {
        return response.json()
    })
    .catch((error) => {
      console.error('error', error);
      return error;
    });
    return responses;
  }
 
  function createProperResponse(response) {
    const statusCode = response.status;
    const data = response.json();
    return Promise.all([statusCode, data]).then(res => ({
      statusCode: res[0],
      data: res[1]
    }));
  }
  //{"type":"default","status":400,"ok":false,"statusText":"","headers":{"map":{"access-control-expose-headers":"WWW-Authenticate,Server-Authorization","content-length":"78","vary":"origin","date":"Mon, 26 Jul 2021 07:19:53 GMT","cache-control":"no-cache","content-type":"application/json; charset=utf-8","connection":"keep-alive","server":"nginx/1.10.3 (Ubuntu)"}},"url":"https://apps.appsmaventech.com/smuggler_backend/api/v1/user/userRegister","bodyUsed":false,"_bodyInit":{"_data":{"size":78,"offset":0,"blobId":"08cc8376-08dc-4966-944e-31e827cbfd72","__collector":{}}},"_bodyBlob":{"_data":{"size":78,"offset":0,"blobId":"08cc8376-08dc-4966-944e-31e827cbfd72","__collector":{}}}}