export interface GoldPriceResponse {
  success: boolean;
  resultCode: number;
  resultMsg: string;
  resultData?: {
    datas?: {
      price: string;
      upAndDownAmt: string;
      upAndDownRate: string;
      yesterdayPrice: string;
    };
    status: string;
  };
}

const fetchJsonp = (url: string): Promise<GoldPriceResponse> => {
  return new Promise((resolve, reject) => {
    const callbackName = 'jsonp_callback_' + Math.round(1000000 * Math.random());
    const script = document.createElement('script');
    script.referrerPolicy = 'no-referrer'; // Bypass anti-hotlinking by removing Referer header
    
    // Set up the global callback function
    (window as any)[callbackName] = (data: GoldPriceResponse) => {
      delete (window as any)[callbackName];
      document.body.removeChild(script);
      resolve(data);
    };

    // Handle network errors
    script.onerror = () => {
      delete (window as any)[callbackName];
      document.body.removeChild(script);
      reject(new Error('JSONP request failed, maybe network error'));
    };

    // Append script to trigger the request
    script.src = `${url}&callback=${callbackName}`;
    document.body.appendChild(script);
  });
};

export const fetchLatestGoldPrice = async (): Promise<number> => {
  try {
    // JD Gold API natively supports JSONP, which allows us to completely bypass CORS
    // without relying on any Vite proxy or third-party proxy servers!
    const url = 'https://api.jdjygold.com/gw2/generic/jrm/h5/m/stdLatestPrice?productSku=1961543816';
    const result = await fetchJsonp(url);
    
    if (result.success && result.resultData?.datas?.price) {
      return parseFloat(result.resultData.datas.price);
    }
    throw new Error(result.resultMsg || '获取金价失败');
  } catch (error) {
    console.error('Fetch gold price failed:', error);
    throw error;
  }
};
