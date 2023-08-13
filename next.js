// src/const.ts
var 地址= "您的地址" ;
var  TOKEN = "你的_TOKEN" ;

// src/verify.ts
var  verify = async  (数据, _sign ) => {
  const  signSlice = _sign. 分割（“：” ）；
  if  ( ! signSlice [ signSlice.length - 1 ] ) { 
    返回 “过期缺失”；
  }
  const  expire = parseInt ( signSlice [ signSlice.length - 1 ] ) ; _
  if  ( isNaN (过期) )  {
    return  "过期无效" ;
  }
  if  (过期 < 日期。现在( ) / 1e3 && 过期 > 0 )  {
    返回 “过期已过期”；
  }
  const  right =等待 hmacSha256Sign (数据, 过期) ;
  if  ( _sign !== 对)  {
    返回 “符号不匹配”；
  }
  返回 “”；
} ;
var  hmacSha256Sign =异步 （数据，过期） => {
  const  key =等待加密。微妙的。导入密钥(
    “生的”，
    新的文本编码器（）。编码（令牌），
    { 名称：“HMAC”，哈希：“SHA-256”  }，
    假,
    [ “签名”，“验证” ]
  ）；
  const  buf =等待加密。微妙的。标志（
    {
      名称：“HMAC”，
      哈希：“SHA-256”
    } ,
    key,
    new TextEncoder().encode(`${data}:${expire}`)
  );
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, "-").replace(/\//g, "_") + ":" + expire;
};

// src/handleDownload.ts
async function handleDownload(request) {
  const origin = request.headers.get("origin") ?? "*";
  const url = new URL(request.url);
  const path = decodeURIComponent(url.pathname);
  const sign = url.searchParams.get("sign") ?? "";
  const verifyResult = await verify(path, sign);
  if (verifyResult !== "") {
    const resp2 = new Response(
      JSON.stringify({
        code: 401,
        message: verifyResult
      }),
      {
        headers: {
          "content-type": "application/json;charset=UTF-8"
        }
      }
    );
    resp2.headers.set("Access-Control-Allow-Origin", origin);
    return resp2;
  }
  let resp = await fetch(`${ADDRESS}/api/fs/link`, {
    method: "POST",
    headers: {
      "content-type": "application/json;charset=UTF-8",
      Authorization: TOKEN
    },
    body: JSON.stringify({
      path
    })
  });
  let res = await resp.json();
  if (res.code !== 200) {
    return new Response(JSON.stringify(res));
  }
  request = new Request(res.data.url, { ...request, redirect: "follow" });
  if (res.data.header) {
    for (const k in res.data.header) {
      for (const v of res.data.header[k]) {
        request.headers.set(k, v);
      }
    }
  }
  let response = await fetch(request);
  response = new Response(response.body, response);
  response.headers.delete("set-cookie");
  response.headers.set("Access-Control-Allow-Origin", origin);
  response.headers.append("Vary", "Origin");
  return response;
}

// src/handleOptions.ts
function handleOptions(request) {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
    "Access-Control-Max-Age": "86400"
  };
  let headers = request.headers;
  if (headers.get("Origin") !== null && headers.get("Access-Control-Request-Method") !== null) {
    let respHeaders = {
      ...corsHeaders,
      "Access-Control-Allow-Headers": request.headers.get("Access-Control-Request-Headers") || ""
    };
    return new Response(null, {
      headers: respHeaders
    });
  } else {
    return new Response(null, {
      headers: {
        Allow: "GET, HEAD, POST, OPTIONS"
      }
    });
  }
}

// src/index.ts
var src_default = {
  async fetch(request, env, ctx) {
    if (request.method === "OPTIONS") {
      return handleOptions(request);
    }
    return handleDownload(request);
  }
};
export {
  src_default as default
};
//# sourceMappingURL=index.js.map
